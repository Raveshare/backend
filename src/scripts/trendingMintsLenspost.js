const prisma = require("../prisma");
const { request, gql } = require("graphql-request");
const { init } = require("@airstack/node");
// const { getGlobalTrendingMints } = require("../../src/functions/airstack/getGlobalTrendingMints.js");

init(process.env.AIRSTACK_API_KEY);

async function wallets() {
  try {
    let data = [];
    let count = 1;
    let wallets = await prisma.owners.findMany({
      where: {
        NOT: {
          evm_address: null,
        },
      },
      orderBy: {
        points: "desc",
      },
    });
    // return wallets;
    for (let wallet of wallets) {
      if (wallet.evm_address) {
        data.push(wallet.evm_address);
        count++;

        if (count >= 100) {
          break;
        }
      }
    }

    return data;
  } catch (err) {
    console.log(err);
  }
}

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
    $lensPostusers: [Identity!]
  ) {
    TokenTransfers(
      input: {
        filter: {
          from: { _eq: "0x0000000000000000000000000000000000000000" }
          blockTimestamp: { _gte: $startTime, _lte: $endTime }
          tokenType: { _in: $tokenType }
          formattedAmount: { _gt: 0 }
          to: { _in: $lensPostusers }
          operator: { _in: $lensPostusers }
        }
        blockchain: $chain
        order: { blockTimestamp: DESC }
        limit: $limit
      }
    ) {
      TokenTransfer {
        amount
        tokenType
        type
        tokenAddress
        tokenId
        to {
          addresses
          primaryDomain {
            name
          }
        }
      }
    }
  }
`;

async function getGlobalTrendingMints() {
  try {
    const date = new Date();

    const Identidy = await wallets();
    // return Identidy;
    const variables = {
      startTime: new Date(
        date.getTime() - 7 * 24 * 60 * 60 * 1000
      ).toISOString(),
      endTime: date.toISOString(),
      tokenType: ["ERC20", "ERC721", "ERC1155"],
      chain: "ethereum",
      limit: 100,
      lensPostusers: Identidy,
    };

    let resp = await request(
      "https://api.airstack.xyz/gql",
      globalTrendingMints,
      variables
    );

    return resp.TokenTransfers.TokenTransfer;
  } catch (err) {
    console.log(err);
  }
}

async function trendingMintsLenspost(req, res) {
  try {
    let data = await getGlobalTrendingMints();

    let response = await scoring(data);

    res.status(200).send({
      status: "success",
      data: response,
    });
  } catch (error) {
    res.status(400).send({
      status: "error",
      message: error.message,
    });
  }
}

module.exports = trendingMintsLenspost;
