const prisma = require("../prisma");
const { request, gql } = require("graphql-request");
const { init } = require("@airstack/node");
const { forEach } = require("lodash");
const {
  getCache,
  setCacheWithExpire,
} = require("../functions/cache/handleCache");
// const { getGlobalTrendingMints } = require("../../src/functions/airstack/getGlobalTrendingMints.js");

init(process.env.AIRSTACK_API_KEY);

async function getWallets() {
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

        if (count >= 200) {
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
    let data = [];

    let wallets = await getWallets();
    // return Identidy;
    // wallets = "0xa6bcB89f21E0BF71E08dEd426C142757791e17df";
    const count = 1;
    for (let wallet of wallets) {
      console.log(wallet);
      const variables = {
        startTime: new Date(
          date.getTime() - 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        endTime: date.toISOString(),
        tokenType: ["ERC20", "ERC721", "ERC1155"],
        chain: "polygon",
        limit: 100,
        lensPostusers: [wallet],
      };
      let resp = await request(
        process.env.AIRSTACK_API_URL,
        globalTrendingMints,
        variables
      );

      if (resp.TokenTransfers.TokenTransfer !== null) {
        data = [...data, ...resp.TokenTransfers.TokenTransfer];
      }
    }
    return data;
  } catch (err) {
    console.log(err);
  }
}

async function trendingMintsLenspost(req, res) {
  try {
    let data = getCache("trendingMintsLenspost");
    if (!data) data = await getGlobalTrendingMints();

    let response = await scoring(data);
    console.log(response);
    response.sort((a, b) => b.score - a.score);

    setCacheWithExpire("trendingMintsLenspost", JSON.stringify(response), 3600);

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
