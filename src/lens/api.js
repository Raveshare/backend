const { request, gql } = require("graphql-request");
const ownerSchema = require("../schema/ownerSchema");

const LENS_API_URL = process.env.LENS_API_URL;
const NODE_ENV = process.env.NODE_ENV;

const checkDispatcherQuery = gql`
  query Profile($profileId: ProfileId!) {
    profile(request: { profileId: $profileId }) {
      dispatcher {
        address
        canUseRelay
      }
    }
  }
`;

async function checkDispatcher(profileId) {
  const variables = { profileId };
  let resp = await request(LENS_API_URL, checkDispatcherQuery, variables);

  if (resp.profile.dispatcher === null) {
    return false;
  }

  return resp.profile.dispatcher.canUseRelay;
}

const getFollowContractAddressQuery = gql`
  query Profile($profileId: ProfileId!) {
    profile(request: { profileId: $profileId }) {
      followNftAddress
    }
  }
`;

async function getFollowContractAddress(profileId) {
  const variables = { profileId };
  let resp = await request(
    LENS_API_URL,
    getFollowContractAddressQuery,
    variables
  );

  return resp.profile.followNftAddress;
}

const challengeQuery = gql`
  query Challenge($address: EthereumAddress!) {
    challenge(request: { address: $address }) {
      text
    }
  }
`;

async function challenge(address) {
  const variables = { address };
  let resp = await request(LENS_API_URL, challengeQuery, variables);
  return resp.challenge.text;
}

const authenticateQuery = gql`
  mutation Authenticate($address: EthereumAddress!, $signature: Signature!) {
    authenticate(request: { address: $address, signature: $signature }) {
      accessToken
      refreshToken
    }
  }
`;

const authenticate = async (address, signature) => {
  const variables = { address, signature };
  const result = await request(LENS_API_URL, authenticateQuery, variables);

  return result.authenticate;
};

const getProfileQuery = gql`
  query DefaultProfile($address: EthereumAddress!) {
    defaultProfile(request: { ethereumAddress: $address }) {
      handle
      id
    }
  }
`;

async function getProfileHandleAndId(address) {
  const variables = { address };
  let resp = await request(LENS_API_URL, getProfileQuery, variables);

  return {
    handle: resp.defaultProfile.handle,
    id: resp.defaultProfile.id,
  };
}

const getProfileAddressFromHandleQuery = gql`
  query Profile($handle: Handle!) {
    profile(request: { handle: $handle }) {
      id
      ownedBy
    }
  }
`;

async function getProfileAddressFromHandle(handle) {
  if (!handle.endsWith(".lens")) handle = handle + ".lens";
  const variables = { handle };
  console.log(variables);
  let resp = await request(
    LENS_API_URL,
    getProfileAddressFromHandleQuery,
    variables
  );

  console.log(resp);

  return resp.profile.ownedBy;
}

const checkAccessTokenQuery = gql`
  query Query($accessToken: Jwt!) {
    verify(request: { accessToken: $accessToken })
  }
`;

async function checkAccessToken(accessToken) {
  const variables = { accessToken };
  let resp = await request(LENS_API_URL, checkAccessTokenQuery, variables);

  console.log(resp);

  return resp.verify;
}

const refreshTokenQuery = gql`
  mutation Refresh($refreshToken: Jwt!) {
    refresh(request: { refreshToken: $refreshToken }) {
      accessToken
      refreshToken
    }
  }
`;

async function refreshToken(refreshToken) {
  const variables = { refreshToken };
  let resp = await request(LENS_API_URL, refreshTokenQuery, variables);

  return resp.refresh;
}

const validateMetadataQuery = gql`
  query ValidatePublicationMetadata($metadatav2: PublicationMetadataV2Input!) {
    validatePublicationMetadata(request: { metadatav2: $metadatav2 }) {
      valid
      reason
    }
  }
`;

async function validateMetadata(metadatav2) {
  const variables = { metadatav2 };
  const result = await request(LENS_API_URL, validateMetadataQuery, variables);

  return result.validatePublicationMetadata;
}

const createSetDispatcherTypedData = gql`
  mutation CreateSetDispatcherTypedData($profileId: ProfileId!) {
    createSetDispatcherTypedData(request: { profileId: $profileId }) {
      id
      expiresAt
      typedData {
        types {
          SetDispatcherWithSig {
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
          profileId
          dispatcher
        }
      }
    }
  }
`;

const setDispatcher = async (profileId, accessToken) => {
  const variables = {
    profileId: profileId,
  };

  const result = await request(
    LENS_API_URL,
    createSetDispatcherTypedData,
    variables,
    {
      Authorization: `Bearer ${accessToken}`,
      Origin: "https://app.lenspost.xyz",
    }
  );

  return result.createSetDispatcherTypedData?.typedData;
};

const createPostViaDispatcherQuery = gql`
  mutation CreatePostViaDispatcher($request: CreatePublicPostRequest!) {
    createPostViaDispatcher(request: $request) {
      ... on RelayerResult {
        txHash
        txId
      }
      ... on RelayError {
        reason
      }
    }
  }
`;

async function createPostViaDispatcher(
  postRequest,
  accessToken,
  refreshAccessToken,
  address
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

    let owner = await ownerSchema.findOne({
      where: {
        address: address,
      },
    });
    owner.lens_auth_token = lens_auth_token;
    await owner.save();
  }

  const result = await request(
    LENS_API_URL,
    createPostViaDispatcherQuery,
    variables,
    {
      Authorization: `Bearer ${accessToken}`,
      Origin: "https://app.lenspost.xyz",
    }
  );

  return result.createPostViaDispatcher;
}

const NftsQuery = gql`
  query Nfts($request: NFTsRequest!) {
    nfts(request: $request) {
      items {
        contractAddress
        symbol
        tokenId
        name
        description
        originalContent {
          uri
          metaType
        }
        chainId
      }
      pageInfo {
        prev
        next
      }
    }
  }
`;

const getNfts = async (nftrequest) => {
  const variables = {
    request: nftrequest,
  };

  const result = await request(LENS_API_URL, NftsQuery, variables);

  return result.nfts;
};

const getWhoCollectedPublicationQuery = gql`
  query WhoCollectedPublication($request: WhoCollectedPublicationRequest!) {
    whoCollectedPublication(request: $request) {
      items {
        address
      }
      pageInfo {
        next
      }
    }
  }
`;

const getWhoCollectedPublication = async (whocollectedpublicationrequest) => {
  const variables = {
    request: whocollectedpublicationrequest,
  };

  const result = await request(
    LENS_API_URL,
    getWhoCollectedPublicationQuery,
    variables
  );

  return result.whoCollectedPublication;
};

const doesFollowQuery = gql`
  query DoesFollow($followerAddress: EthereumAddress!, $profileId: ProfileId!) {
    doesFollow(
      request: {
        followInfos: [
          { followerAddress: $followerAddress, profileId: $profileId }
        ]
      }
    ) {
      follows
    }
  }
`;

const doesFollow = async (followerAddress) => {
  let profileId;
  if (NODE_ENV === "development") profileId = "0x90c3";
  else profileId = "0x01b984";

  const variables = {
    followerAddress: followerAddress,
    profileId: profileId,
  };

  const result = await request(LENS_API_URL, doesFollowQuery, variables);

  return result.doesFollow[0]?.follows;
};

const hasCollectedQuery = gql`
  query Publication($publicationId: InternalPublicationId!) {
    publication(request: { publicationId: $publicationId }) {
      __typename
      ... on Post {
        hasCollectedByMe
      }
    }
  }
`;

const hasCollected = async (publicationId, address, accessToken , refreshAccessToken) => {
  const variables = {
    publicationId: publicationId,
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

    let owner = await ownerSchema.findOne({
      where: {
        address: address,
      },
    });
    owner.lens_auth_token = lens_auth_token;
    await owner.save();
  }

  const result = await request(LENS_API_URL, hasCollectedQuery, variables, {
    Authorization: `Bearer ${accessToken}`,
  });

  return result.publication?.hasCollectedByMe;
};

module.exports = {
  checkDispatcher,
  checkAccessToken,
  validateMetadata,
  refreshToken,
  createPostViaDispatcher,
  challenge,
  authenticate,
  getProfileHandleAndId,
  getFollowContractAddress,
  setDispatcher,
  getNfts,
  getWhoCollectedPublication,
  getProfileAddressFromHandle,
  doesFollow,
  hasCollected,
};
