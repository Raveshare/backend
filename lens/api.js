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

const challengeQuery = gql`
  query Challenge($address: EthereumAddress!) {
    challenge(request: { address: $address }) {
      text
    }
  }
`

async function challenge(address) {
  const variables = { address };
  let resp = await request(LENS_API_URL, challengeQuery, variables);
  console.log("response" , resp)
  return resp.challenge.text;
}


const authenticateQuery = gql`
  mutation Authenticate(
    $address: EthereumAddress!
    $signature: Signature!
  ) {
    authenticate(request: {
      address: $address,
      signature: $signature
    }) {
      accessToken
      refreshToken
    }
  }
`

const authenticate = async (address, signature) => {
  const variables = { address, signature };
  const result = await request(LENS_API_URL, authenticateQuery, variables);

  console.log("result" , result)

  return result.authenticate;
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

const refreshTokenQuery = gql`
mutation Refresh($refreshToken: Jwt!) {
  refresh(request: {
    refreshToken: $refreshToken
  }) {
    accessToken
    refreshToken
  }
}`

async function refreshToken(refreshToken) {
  const variables = { refreshToken };
  let resp = await request(LENS_API_URL, refreshTokenQuery, variables);

  return resp.data.refresh;
}

const validateMetadataQuery = gql`
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

const createPostViaDispatcherQuery = gql`
mutation CreatePostViaDispatcher($request: CreatePublicPostRequest!) {
  createPostViaDispatcher(
    request: $request
  ) {
    ... on RelayerResult {
      txHash
      txId
    }
    ... on RelayError {
      reason
    }
  }
}`

async function createPostViaDispatcher(postRequest,accessToken) {
  const variables = { postRequest };
  const result = await request(LENS_API_URL, createPostViaDispatcherQuery, variables , {
    Authorization: `Bearer ${accessToken}`
  });

  return result.data.createPostViaDispatcher;
}

module.exports = {
    checkDispatcher,
    checkAccessToken,
    validateMetadata,
    refreshToken,
    createPostViaDispatcher,
    challenge,
    authenticate
}