const prisma = require("../prisma");
const { request, gql } = require("graphql-request");
const { init } = require("@airstack/node");
const { forEach } = require("lodash");
const {
  getCache,
  setCacheWithExpire,
} = require("../functions/cache/handleCache");

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
      if (wallet.evm_address && wallet.evm_address.length === 42) {
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

async function getGlobalTrendingMints() {
  try {
    const date = new Date();
    let data = [];

    let wallets = await getWallets();
    const requests = wallets.map(async (wallet) => {
      console.log("wallet", wallet);
      const variables = {
        startTime: new Date(
          date.getTime() - 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        tokenType: ["ERC721", "ERC1155"],
        chain: "polygon",
        limit: 100,
        lensPostusers: [wallet],
      };
      const resp = await request(
        process.env.AIRSTACK_API_URL,
        globalTrendingMints,
        variables
      );
      if (resp.TokenTransfers.TokenTransfer !== null) {
        return resp.TokenTransfers.TokenTransfer;
      }
      return [];
    });

    const results = await Promise.all(requests);
    console.log(results);
    data = results.flat();

    return data;
  } catch (err) {
    console.log(err);
  }
}

const globalTrendingMints = gql`
  query MyQuery(
    $startTime: Time
    $tokenType: [TokenType!]
    $chain: TokenBlockchain!
    $limit: Int
    $lensPostusers: [Identity!]
  ) {
    TokenTransfers(
      input: {
        filter: {
          from: { _eq: "0x0000000000000000000000000000000000000000" }
          blockTimestamp: { _gte: $startTime }
          tokenType: { _in: $tokenType }
          formattedAmount: { _gt: 0 }
          to: { _in: $lensPostusers }
          operator: { _in: $lensPostusers }
        }
        blockchain: $chain
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

async function scoring(data) {
  try {
    let trendingMints = [];
    console.log("data", data, data.length);

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

async function trendingMintsLenspost(req, res) {
  try {
    let data = getCache("trendingMintsLenspost");
    data = null; // This is done only for testing purpose.
    if (!data) {
      data = await getGlobalTrendingMints();

      let response = await scoring(data);
      console.log(response);
      response.sort((a, b) => b.score - a.score);

      setCacheWithExpire(
        "trendingMintsLenspost",
        JSON.stringify(response),
        3600
      );
      res.status(200).send({
        status: "success",
        data: response,
      });
    } else {
      let response = JSON.parse(data);
      response.sort((a, b) => b.score - a.score);
      res.status(200).send({
        status: "success",
        data: response,
      });
    }
  } catch (error) {
    res.status(400).send({
      status: "error",
      message: error.message,
    });
  }
}

module.exports = trendingMintsLenspost;
