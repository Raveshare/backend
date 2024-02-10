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
const arb_config = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.ARB_MAINNET,
};
const opt_config = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.OPT_MAINNET,
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
const arb_alchemy = new Alchemy(arb_config);
const opt_alchemy = new Alchemy(opt_config);

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

    let walletWhitelistedRegistry = await redis.get(
      "wallet_whitelisted_registry"
    );
    walletWhitelistedRegistry = JSON.parse(walletWhitelistedRegistry);

    walletWhitelistedRegistry = walletWhitelistedRegistry.items;

    console.log(walletWhitelistedRegistry);

    for (let i = 0; i < walletWhitelistedRegistry.length; i++) {
      const registry = walletWhitelistedRegistry[i];

      if (registry.type === "NFT") {
        let response = await eth_alchemy.nft.verifyNftOwnership(walletAddress, [
          registry.wallet,
        ]);

        let res = Object.values(response);

        for (let j = 0; j < res.length; j++) {
          if (res[j]) {
            console.log("True 89");
            return true;
          }
        }
      } else if (registry.type === "CONTRACT") {
        let response;
        if (registry.network === "ETH") {
          response = await eth_alchemy.core.getTokenBalances(walletAddress, [
            registry.wallet,
          ]);
        } else if (registry.network === "POLYGON") {
          response = await poly_alchemy.core.getTokenBalances(walletAddress, [
            registry.wallet,
          ]);
        } else if (registry.network === "BASE") {
          response = await base_alchemy.core.getTokenBalances(walletAddress, [
            registry.wallet,
          ]);
        }
        let tokenBalance = response.tokenBalances[0].tokenBalance;
        tokenBalance = parseInt(tokenBalance);
        console.log(tokenBalance);
        if (tokenBalance > 0) {
          console.log("True 112");
          return true;
        }
      }
    }

    return false;
  } catch (err) {
    console.log(err);
    return false;
  }
};

module.exports = { getIsWhitelisted, redis };
