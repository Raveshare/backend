const { request, gql } = require("graphql-request");
const prisma = require("../prisma");

const LENS_API_URL = process.env.LENS_API_URL;
const NODE_ENV = process.env.NODE_ENV;

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

  const result = await request(
    LENS_API_URL,
    createPostViaDispatcherQuery,
    variables,
    {
      Authorization: `Bearer ${accessToken}`,
      Origin: "https://app.lenspost.xyz",
    }
  );

  console.log(result)

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

const hasCollected = async (
  publicationId,
  evmAddress,
  accessToken,
  refreshAccessToken
) => {
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

    await prisma.owners.update({
      where: {
        evm_address: evmAddress,
      },
      data: {
        lens_auth_token: lens_auth_token,
      },
    });
  }

  const result = await request(LENS_API_URL, hasCollectedQuery, variables, {
    Authorization: `Bearer ${accessToken}`,
  });

  return result.publication?.hasCollectedByMe;
};

module.exports = {
  createPostViaDispatcher,
  getNfts,
  getWhoCollectedPublication,
  hasCollected,
};
