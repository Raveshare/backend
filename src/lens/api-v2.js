const { request, gql } = require("graphql-request");

const LENS_API_URL = process.env.LENS_API_URL;
const NODE_ENV = process.env.NODE_ENV;
const { isEmpty } = require("lodash");

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
  return resp.profile.signless;
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

module.exports = {
  getProfilesManagedByAddress,
  challenge,
  checkProfileManager,
  checkIfFollow,
};
