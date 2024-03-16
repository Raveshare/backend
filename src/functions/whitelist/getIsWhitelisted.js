const { Alchemy, Network } = require("alchemy-sdk");
const checkIfFollow = require("../../lens/api-v2").checkIfFollow;
const axios = require("axios");
const { request, gql } = require("graphql-request");

const AIRSTACK_API_KEY = process.env.AIRSTACK_API_KEY;
const AIRSTACK_API_URL = "https://api.airstack.xyz/gql";

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

const checkZoraNetwork = async (walletAddress, tokenAddress) => {
  const query = gql`
    query MyQuery(
      $_eq: Address
      $_eq1: Identity
      $blockchain: TokenBlockchain!
    ) {
      TokenBalances(
        input: {
          filter: { tokenAddress: { _eq: $_eq }, owner: { _eq: $_eq1 } }
          blockchain: $blockchain
        }
      ) {
        TokenBalance {
          amount
        }
      }
    }
  `;

  const variables = {
    _eq: tokenAddress,
    _eq1: walletAddress,
    blockchain: "zora",
  };

  const response = await request(AIRSTACK_API_URL, query, variables, {
    headers: {
      Authorization: `${AIRSTACK_API_KEY}`,
    },
  });

  const tokenBalance = response.TokenBalances?.TokenBalance;
  return (
    tokenBalance &&
    tokenBalance.length > 0 &&
    parseInt(tokenBalance[0].amount) > 0
  );
};
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

    for (let i = 0; i < walletWhitelistedRegistry.length; i++) {
      const registry = walletWhitelistedRegistry[i];

      if (registry.type === "NFT" && walletAddress.startsWith("0x")) {
        let response = await eth_alchemy.nft.verifyNftOwnership(walletAddress, [
          registry.wallet,
        ]);

        let res = Object.values(response);

        for (let j = 0; j < res.length; j++) {
          if (res[j]) {
            return true;
          }
        }
      } else if (
        registry.type === "CONTRACT" &&
        walletAddress.startsWith("0x")
      ) {
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
        } else if (registry.network === "OPETH") {
          response = await opt_alchemy.core.getTokenBalances(walletAddress, [
            registry.wallet,
          ]);
        }
        if (response?.tokenBalances[0]?.tokenBalance) {
          let tokenBalance = response.tokenBalances[0].tokenBalance;
          tokenBalance = parseInt(tokenBalance);
          if (tokenBalance > 0) {
            return true;
          }
        }

        if (registry.network === "ZORA") {
          const isWhitelisted = await checkZoraNetwork(
            walletAddress,
            registry.wallet
          );
          if (isWhitelisted) {
            return true;
          }
        }
      } else if (registry.network === "SOL") {
        const url = process.env.HELIUS_RPC_URL;
        const response = await axios.post(
          url,
          {
            jsonrpc: "2.0",
            id: "my-id",
            method: "searchAssets",
            params: {
              ownerAddress: walletAddress,
              grouping: ["collection", registry.wallet],
              page: 1,
              limit: 1000,
            },
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.result.total > 0) {
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
