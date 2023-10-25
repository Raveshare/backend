const { request, gql } = require("graphql-request");

const LENS_API_URL = process.env.LENS_API_URL;
const NODE_ENV = process.env.NODE_ENV;

const profileManagedQuery = gql`
  query ProfilesManaged($for: EvmAddress!) {
    profilesManaged(request: { for: $for }) {
      items {
        id
        handle
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
  console.log(resp.profilesManaged.items);
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

module.exports = {
  getProfilesManagedByAddress,
  challenge,
  checkProfileManager,
};
