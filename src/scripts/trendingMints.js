const prisma = require("../prisma");
const { request, gql } = require("graphql-request");
const { init } = require("@airstack/node");

const { getCache, setCacheWithExpire } = require("../functions/cache/handleCache");
// const { getGlobalTrendingMints } = require("../../src/functions/airstack/getGlobalTrendingMints.js");

init(process.env.AIRSTACK_API_KEY);

async function scoring(data) {
  try {
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
  } catch (err) {
    console.log(err);
  }
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
  try {
    const date = new Date();
    const variables = {
      startTime: new Date(
        date.getTime() - 7 * 24 * 60 * 60 * 1000
      ).toISOString(),
      endTime: date.toISOString(),
      tokenType: ["ERC20", "ERC721", "ERC1155"],
      chain: "ethereum",
      limit: 100,
    };

    let resp = await request(
      process.env.AIRSTACK_API_URL,
      globalTrendingMints,
      variables
    );

    console.log(resp.TokenTransfers.TokenTransfer);

    return resp.TokenTransfers.TokenTransfer;
  } catch (err) {
    console.log(err);
  }
}

async function trendingMints(req, res) {
  try {
    let data = getCache("trendingMints");
    if (!data) {
      data = await getGlobalTrendingMints();

      let response = await scoring(data);
      response.sort((a, b) => b.score - a.score);

      setCacheWithExpire("trendingMints", JSON.stringify(response), 3600);

      res.status(200).send({
        status: "success",
        data: response,
      });
    } else {
      res.status(200).send({
        status: "success",
        data: JSON.parse(data),
      });
    }
  } catch (error) {
    res.status(400).send({
      status: "error",
      message: error.message,
    });
  }
}

module.exports = trendingMints;
