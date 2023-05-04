const { request , gql } = require('graphql-request');

const LENS_API_URL = 'https://api-mumbai.lens.dev/';

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

    return resp.profile.dispatcher.canUseRelay;

}

const checkAccessTokenQuery = gql`
query Query($accessToken : jwt!) {
  verify(request: {
    accessToken: $accessToken
  })
}`

async function checkAccessToken(accessToken) {
  const variables = { accessToken };
  let resp = await request(LENS_API_URL, checkAccessTokenQuery, variables);

  return resp.data.verify;
}

export const validateMetadataQuery = gql`
query ValidatePublicationMetadata ($metadatav2: PublicationMetadataV2Input!) {
  validatePublicationMetadata(request: {
    metadatav2: $metadatav2
  }) {
    valid
    reason
  }
}
`

async function validateMetadata(metadatav2) {
  const variables = { metadatav2 };
  const result = await request(LENS_API_URL, validateMetadataQuery, variables);

  return result.data.validatePublicationMetadata;
}

module.exports = {
    checkDispatcher,
    checkAccessToken,
    validateMetadata
}