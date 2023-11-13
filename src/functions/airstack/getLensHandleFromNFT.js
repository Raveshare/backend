const { request, gql } = require("graphql-request");
const AIRSTACK_API_KEY = process.env.AIRSTACK_API_KEY;
const AIRSTACK_API_URL = "https://api.airstack.xyz/gql";

const creatorHandleQuery = gql`
  query MyQuery($eth: Address) {
    Tokens(input: { filter: { address: { _eq: $eth } }, blockchain: polygon }) {
      Token {
        name
      }
    }
  }
`;

const getLensHandleFromNFT = async (nftAddress) => {
  let variables = {
    eth: nftAddress,
  };

  let data = await request(AIRSTACK_API_URL, creatorHandleQuery, variables, {
    "Authorization": AIRSTACK_API_KEY,
  });

  console.log(data.Tokens?.Token[0]?.name.split("-")[0]);
  return data.Tokens?.Token[0]?.name.split("-")[0];
};

module.exports = getLensHandleFromNFT;
