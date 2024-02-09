const { Alchemy, Network } = require("alchemy-sdk");
const checkIfFollow = require("../../lens/api-v2").checkIfFollow;

const eth_config = {
  apiKey: process.env.ALCHEMY_API_KEY, // Replace with your API key
  network: Network.ETH_MAINNET, // Replace with your network
};

const poly_config = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.MATIC_MAINNET,
};

const base_config = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.BASE_MAINNET,
};

const { createClient } = require("redis");

const redis = createClient({
  url: process.env.REDIS_CACHE,
});

redis.on("error", (err) => {
  console.log("Redis error: ", err);
});

redis.on("connect", () => {
  console.log("Redis client connected");
});

redis.connect();

const eth_alchemy = new Alchemy(eth_config);
const poly_alchemy = new Alchemy(poly_config);
const base_alchemy = new Alchemy(base_config);

const getIsWhitelisted = async (walletAddress) => {
  try {
    let follow = false;
    if (walletAddress.startsWith("0x"))
      follow = await checkIfFollow(walletAddress);

    if (follow) {
      return true;
    }
    let walletAddressU = walletAddress.toUpperCase();

    let walletWhitelisted = await redis.get("whitelisted_wallets");
    walletWhitelisted = JSON.parse(walletWhitelisted);

    walletWhitelisted = walletWhitelisted.map((wallet) => wallet.toUpperCase());

    if (walletWhitelisted.includes(walletAddressU)) {
      return true;
    }

    let res2 = await eth_alchemy.nft.verifyNftOwnership(walletAddress, [
      "0x13015585932752A8e6Dc24bE6c07c420381AF53d",
    ]);

    let res3 = await eth_alchemy.core.getTokenBalances(walletAddress, [
      "0x41C21693e60FC1a5dBb7c50e54E7A6016aA44C99",
    ]);

    let res4 = await base_alchemy.core.getTokenBalances(walletAddress, [
      "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed",
    ]);

    let res5 = await base_alchemy.core.getTokenBalances(walletAddress, [
      "0xEAB1fF15f26da850315b15AFebf12F0d42dE5421",
    ]);

    let res6 = await base_alchemy.core.getTokenBalances(walletAddress, [
      "0x91F45aa2BdE7393e0AF1CC674FFE75d746b93567",
    ]);

    let tokenBalance = res3.tokenBalances[0].tokenBalance;
    tokenBalance = parseInt(tokenBalance);
    if (tokenBalance > 0) {
      console.log("token balance > 0");
      return true;
    } else {
      console.log("token balance <= 0");
    }

    tokenBalance = res4.tokenBalances[0].tokenBalance;
    tokenBalance = parseInt(tokenBalance);
    if (tokenBalance > 0) {
      console.log("token balance > 0");
      return true;
    } else {
      console.log("token balance <= 0");
    }

    tokenBalance = res5.tokenBalances[0].tokenBalance;
    tokenBalance = parseInt(tokenBalance);
    if (tokenBalance > 0) {
      console.log("token balance > 0");
      return true;
    } else {
      console.log("token balance <= 0");
    }

    tokenBalance = res6.tokenBalances[0].tokenBalance;
    tokenBalance = parseInt(tokenBalance);
    if (tokenBalance > 0) {
      console.log("token balance > 0");
      return true;
    } else {
      console.log("token balance <= 0");
    }

    let res = Object.values(res2);

    for (let i = 0; i < res.length; i++) {
      if (res[i]) {
        return true;
      }
    }

    return false;
  } catch (err) {
    console.log(err);
    return false;
  }
};

module.exports = { getIsWhitelisted, redis };
