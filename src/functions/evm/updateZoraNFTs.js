const { request, gql } = require("graphql-request");
const ZORA_API_URL = process.env.ZORA_API_URL;

const getZoraNFTsQuery = gql`
  query OwnedNFTs($owner: [String!]) {
    tokens(
      networks: [{ network: ZORA, chain: ZORA_MAINNET }]
      pagination: { limit: 10, after: "eyJza2lwIjogMzB9" }
      where: { ownerAddresses: $owner }
    ) {
      nodes {
        token {
          collectionAddress
          tokenId
          name
          owner
          image {
            url
          }
          metadata
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

async function getZoraNFTs(owner) {
  const variables = {
    owner: [owner],
  };
  let resp = await request(ZORA_API_URL, getZoraNFTsQuery, variables);
  return resp.tokens.nodes;
}

module.exports = {
  getZoraNFTs,
};
