const { request, gql } = require("graphql-request");

async function scoring(data) {
  let trendingMints = [];

  data.forEach((val) => {
    const { tokenAddress, chain } = val ?? {};
    const valIndex = trendingMints.findIndex((value) => {
      return value?.tokenAddress === tokenAddress && value?.chain === chain;
    });
    if (valIndex !== -1) {
      trendingMints[valIndex] = {
        ...trendingMints[valIndex],
        score: trendingMints[valIndex]?.score + 1,
      };
    } else {
      delete val?.tokenId;
      trendingMints.push({ ...val, score: 1 });
    }
  });

  return trendingMints;
}

const globalTrendingMints = gql`
  query MyQuery(
    $startTime: Time
    $endTime: Time
    $tokenType: [TokenType!]
    $chain: TokenBlockchain!
    $limit: Int
  ) {
    TokenTransfers(
      input: {
        filter: {
          from: { _eq: "0x0000000000000000000000000000000000000000" }
          blockTimestamp: { _gte: $startTime, _lte: $endTime }
          tokenType: { _in: $tokenType }
        }
        blockchain: $chain
        order: { blockTimestamp: DESC }
        limit: $limit
      }
    ) {
      TokenTransfer {
        tokenAddress
        operator {
          addresses
        }
        to {
          addresses
        }
        token {
          name
        }
      }
    }
  }
`;

async function getGlobalTrendingMints() {
  const date = new Date();
  const variables = {
    startTime: new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: date.toISOString(),
    tokenType: ["ERC20", "ERC721", "ERC1155"],
    chain: "ethereum",
    limit: 10,
  };

  let resp = await request(
    process.env.AIRSTACK_API_KEY,
    globalTrendingMints,
    variables
  );

  return resp.TokenTransfers.TokenTransfer;
}

module.exports = getGlobalTrendingMints;
