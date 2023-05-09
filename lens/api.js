const { request, gql } = require('graphql-request');
const ownerSchema = require('../schema/ownerSchema');

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

  return result.authenticate;
}

const getProfileQuery = gql`
query DefaultProfile($address: EthereumAddress!) {
  defaultProfile(request: { ethereumAddress: $address}) {
    handle
  }
}`

async function getProfileHandle(address) {
  const variables = { address };
  let resp = await request(LENS_API_URL, getProfileQuery, variables);

  return resp.defaultProfile.handle;
}

const checkAccessTokenQuery = gql`
query Query($accessToken : Jwt!) {
  verify(request: {
    accessToken: $accessToken
  })
}`

async function checkAccessToken(accessToken) {
  const variables = { accessToken };
  let resp = await request(LENS_API_URL, checkAccessTokenQuery, variables);

  return resp.verify;
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

  return resp.refresh;
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

  return result.validatePublicationMetadata;
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

async function createPostViaDispatcher(postRequest, accessToken, refreshAccessToken, address) {
  const variables = {
    "request": postRequest,
  };

  // let isAccessTokenValid = await checkAccessToken(accessToken);
  let isAccessTokenValid = false;
  console.log("isAccessTokenValid", isAccessTokenValid);

  if (!isAccessTokenValid) {
    const tokens = await refreshToken(refreshAccessToken);
    accessToken = tokens.accessToken;
    refreshAccessToken = tokens.refreshToken;

    const lens_auth_token = {
      "accessToken": accessToken,
      "refreshToken": refreshAccessToken
    }

    let owner = await ownerSchema.findOne({
      where: {
        address: address
      }
    }
    );
    owner.lens_auth_token = lens_auth_token;
    await owner.save();
  }

  const result = await request(LENS_API_URL, createPostViaDispatcherQuery, variables, {
    Authorization: `Bearer ${accessToken}`
  });

  return result.createPostViaDispatcher;
}

module.exports = {
  checkDispatcher,
  checkAccessToken,
  validateMetadata,
  refreshToken,
  createPostViaDispatcher,
  challenge,
  authenticate,
  getProfileHandle
}