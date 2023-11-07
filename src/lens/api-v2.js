const { request, gql } = require("graphql-request");
const prisma = require("../prisma");
const LENS_API_URL = process.env.LENS_API_URL;
const NODE_ENV = process.env.NODE_ENV;
const { isEmpty } = require("lodash");

const authenticateMutation = gql`
  mutation Authenticate($id: ChallengeId!, $signature: Signature!) {
    authenticate(request: { id: $id, signature: $signature }) {
      accessToken
      refreshToken
    }
  }
`;

/**
 * Returns the access and refresh token for the given id and signature for a given user
 * @param {*} id
 * @param {*} signature
 * @returns
 */
const authenticate = async (id, signature) => {
  const variables = { id, signature };
  const result = await request(LENS_API_URL, authenticateMutation, variables);

  return result.authenticate;
};

const getProfileAddressFromHandleQuery = gql`
  query Profile($handle: Handle!) {
    profile(request: { forHandle: $handle }) {
      ownedBy {
        address
      }
    }
  }
`;

async function getProfileAddressFromHandle(handle) {
  if (NODE_ENV === "production") {
    if (!handle.startsWith("lens/")) handle = "lens/" + handle;
  } else {
    if (!handle.startsWith("test/")) handle = "test/" + handle;
  }

  const variables = { handle };
  let resp = await request(
    LENS_API_URL,
    getProfileAddressFromHandleQuery,
    variables
  );

  return resp.profile?.ownedBy.address;
}

const checkAccessTokenQuery = gql`
  query Query($accessToken: Jwt!) {
    verify(request: { accessToken: $accessToken })
  }
`;

async function checkAccessToken(accessToken) {
  const variables = { accessToken };
  let resp = await request(LENS_API_URL, checkAccessTokenQuery, variables);

  return resp.verify;
}

const refreshTokenMutation = gql`
  mutation Refresh($refreshToken: Jwt!) {
    refresh(request: { refreshToken: $refreshToken }) {
      accessToken
      refreshToken
    }
  }
`;

async function refreshToken(refreshToken) {
  const variables = { refreshToken };
  let resp = await request(LENS_API_URL, refreshTokenMutation, variables);

  return resp.refresh;
}

const validateMetadataQuery = gql`
  query ValidatePublicationMetadata($metadata: String!) {
    validatePublicationMetadata(request: { json: $metadata }) {
      valid
      reason
    }
  }
`;

async function validateMetadata(metadata) {
  const variables = { metadata };
  let resp = await request(LENS_API_URL, validateMetadataQuery, variables);

  return resp.validatePublicationMetadata;
}

const createProfileManagerQuery = gql`
  mutation createChangeProfileManagersTypedData(
    $options: TypedDataOptions
    $request: ChangeProfileManagersRequest!
  ) {
    createChangeProfileManagersTypedData(options: $options, request: $request) {
      id
      expiresAt
      typedData {
        types {
          ChangeDelegatedExecutorsConfig {
            name
            type
          }
        }
        domain {
          name
          chainId
          version
          verifyingContract
        }
        value {
          nonce
          deadline
          delegatorProfileId
          delegatedExecutors
          approvals
          configNumber
          switchToGivenConfig
        }
      }
    }
  }
`;

async function createProfileManager(accessToken) {
  const variables = {
    request: {
      approveSignless: true,
    },
  };

  let resp = await request(LENS_API_URL, createProfileManagerQuery, variables, {
    Authorization: `Bearer ${accessToken}`,
    Origin: "https://app.lenspost.xyz",
  });

  return {
    typedData : resp.createChangeProfileManagersTypedData?.typedData,
    id: resp.createChangeProfileManagersTypedData?.id,
  }
}

const broadcastTxMutation = gql`
  mutation BroadcastOnchain($request: BroadcastRequest!) {
    broadcastOnchain(request: $request) {
      ... on RelaySuccess {
        txHash
        txId
      }
      ... on RelayError {
        reason
      }
    }
  }
`;

async function broadcastTx(id, signature, user_id) {
  const variables = {
    request: {
      id,
      signature,
    },
  };

  let ownerData = await prisma.owners.findUnique({
    where: {
      id: user_id,
    },
  });

  let { lens_auth_token } = ownerData;
  let { accessToken, refreshToken } = lens_auth_token;

  let isAccessTokenValid = await checkAccessToken(accessToken);

  if (!isAccessTokenValid) {
    const tokens = await refreshToken(refreshAccessToken);
    accessToken = tokens.accessToken;
    refreshAccessToken = tokens.refreshToken;

    const lens_auth_token = {
      accessToken: accessToken,
      refreshToken: refreshAccessToken,
    };

    await prisma.owners.update({
      where: {
        id: user_id,
      },
      data: {
        lens_auth_token: lens_auth_token,
      },
    });
  }

  let resp = await request(LENS_API_URL, broadcastTxMutation, variables, {
    Authorization: `Bearer ${accessToken}`,
    Origin: "https://app.lenspost.xyz",
  })

  return resp.broadcastOnchain;
}

const postOnChainMutation = gql`
  mutation postOnchain($request: OnchainPostRequest!) {
    postOnchain(request: $request) {
      ... on RelaySuccess {
        txHash
        txId
      }
      ... on LensProfileManagerRelayError {
        reason
      }
    }
  }
`;

async function postOnChain(
  postRequest,
  accessToken,
  refreshAccessToken,
  evmAddress
) {
  const variables = {
    request: postRequest,
  };

  let isAccessTokenValid = await checkAccessToken(accessToken);

  if (!isAccessTokenValid) {
    const tokens = await refreshToken(refreshAccessToken);
    accessToken = tokens.accessToken;
    refreshAccessToken = tokens.refreshToken;

    const lens_auth_token = {
      accessToken: accessToken,
      refreshToken: refreshAccessToken,
    };

    await prisma.owners.update({
      where: {
        evm_address: evmAddress,
      },
      data: {
        lens_auth_token: lens_auth_token,
      },
    });
  }

  let resp = await request(LENS_API_URL, postOnChainMutation, variables, {
    Authorization: `Bearer ${accessToken}`,
    Origin: "https://app.lenspost.xyz",
  });

  return resp.postOnchain;
}

const profileManagedQuery = gql`
  query ProfilesManaged($for: EvmAddress!) {
    profilesManaged(request: { for: $for }) {
      items {
        id
        handle {
          fullHandle
        }
        metadata {
          displayName
          picture {
            ... on NftImage {
              collection {
                chainId
                address
              }
              tokenId
              image {
                raw {
                  uri
                  mimeType
                }
              }
              verified
            }
            ... on ImageSet {
              raw {
                mimeType
                uri
              }
            }
            __typename
          }
        }
      }
      pageInfo {
        next
      }
    }
  }
`;

/**
 * Returns the profiles managed by the given address
 * @param {String} evm_address
 * @returns
 */
async function getProfilesManagedByAddress(evm_address) {
  const variables = { for: evm_address };
  let resp = await request(LENS_API_URL, profileManagedQuery, variables);
  return resp.profilesManaged.items;
}

const challengeQuery = gql`
  query Challenge($signedBy: EvmAddress!, $for: ProfileId) {
    challenge(request: { signedBy: $signedBy, for: $for }) {
      text
    }
  }
`;

async function challenge(signedBy, forProfileId) {
  const variables = { signedBy, for: forProfileId };
  let resp = await request(LENS_API_URL, challengeQuery, variables);
  return resp.challenge.text;
}

const checkProfileManagerQuery = gql`
  query Profile($profileId: ProfileId!) {
    profile(request: { forProfileId: $profileId }) {
      signless
    }
  }
`;

async function checkProfileManager(profileId) {
  const variables = { profileId: profileId };
  let resp = await request(LENS_API_URL, checkProfileManagerQuery, variables);
  return resp.profile?.signless;
}

const checkIfFollowQuery = gql`
  query followStatusBulk($request: FollowStatusBulkRequest!) {
    followStatusBulk(request: $request) {
      follower
      profileId
      status {
        value
        isFinalisedOnchain
      }
    }
  }
`;

async function checkIfFollow(walletAddress) {
  let profiles = await getProfilesManagedByAddress(walletAddress);

  let profileId = profiles.map((profile) => profile.id);

  if (isEmpty(profileId)) return false;

  let followInfos = profileId.map((profile) => {
    return {
      follower: "0x0137",
      profileId: profile,
    };
  });

  const variables = {
    request: {
      followInfos: followInfos,
    },
  };
  let resp = await request(LENS_API_URL, checkIfFollowQuery, variables);

  let followStatusBulk = resp.followStatusBulk;

  let doesFollow = followStatusBulk.some(
    (follow) => follow.status.value === true
  );

  return doesFollow;
}

const hasCollectedQuery = gql`
  query hasCollected($request: PublicationsRequest!) {
    publications(request: $request) {
      items {
        ... on Post {
          operations {
            hasActed(request: { filter: { category: COLLECT } }) {
              value
            }
          }
        }
      }
      pageInfo {
        prev
        next
      }
    }
  }
`;

async function hasCollected(
  user_id,
  publicationIds,
  accessToken,
  refreshAccessToken
) {
  const variables = {
    request: {
      where: {
        publicationIds: publicationIds,
      },
    },
  };

  let isAccessTokenValid = await checkAccessToken(accessToken);

  if (!isAccessTokenValid) {
    let tokens = await refreshToken(refreshAccessToken);
    accessToken = tokens.accessToken;
    refreshAccessToken = tokens.refreshToken;

    const lens_auth_token = {
      accessToken: accessToken,
      refreshToken: refreshAccessToken,
    };

    await prisma.owners.update({
      where: {
        id: user_id,
      },
      data: {
        lens_auth_token: lens_auth_token,
      },
    });
  }

  let resp = await request(LENS_API_URL, hasCollectedQuery, variables, {
    Authorization: `Bearer ${accessToken}`,
  });

  let publications = resp.publications.items;

  let hasCollected = publications.map((publication) => {
    return publication.operations.hasActed.value;
  });

  return hasCollected;
}

module.exports = {
  getProfilesManagedByAddress,
  challenge,
  authenticate,
  checkProfileManager,
  getProfileAddressFromHandle,
  checkIfFollow,
  checkAccessToken,
  refreshToken,
  createProfileManager,
  validateMetadata,
  broadcastTx,
  postOnChain,
  hasCollected,
};
