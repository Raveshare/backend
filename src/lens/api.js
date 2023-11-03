const { request, gql } = require("graphql-request");
const prisma = require("../prisma");

const LENS_API_URL = process.env.LENS_API_URL;
const NODE_ENV = process.env.NODE_ENV;

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

module.exports = {
  getNfts,
};
