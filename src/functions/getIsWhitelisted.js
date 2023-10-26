const { Alchemy, Network } = require("alchemy-sdk");
const getProfileHandleAndId = require("../lens/api").getProfileHandleAndId;
// const doesFollow = require("../lens/api").doesFollow;
const checkIfFollow = require("../lens/api-v2").checkIfFollow;

const eth_config = {
  apiKey: process.env.ALCHEMY_API_KEY, // Replace with your API key
  network: Network.ETH_MAINNET, // Replace with your network
};

const { createClient } = require("redis");

const redis = createClient({
  url: process.env.REDIS_URI,
});

redis.on("error", (err) => {
  console.log("Redis error: ", err);
});

redis.on("connect", () => {
  console.log("Redis client connected");
});

redis.connect();

const eth_alchemy = new Alchemy(eth_config);

const getIsWhitelisted = async (walletAddress) => {
  try {
     let follow = await checkIfFollow(walletAddress);

     if (follow) {
       return true;
     } 
    let walletAddressU = walletAddress.toUpperCase();

    let wallets = [
      "0xe3811defd98af92712e54b0b3e1735c1051c86d6",
      "0x8e3c7d5585aa451de1591f28560ce9e3510c0312",
      "0xe48c889310dccb6ad29816cbe17314edf9da9baf",
      "0x62cc3a0a26eb1990d3d21d5b2ab692a47131badf",
      "0xa6bcb89f21e0bf71e08ded426c142757791e17cf",
      "0x77fad8d0fcfd481daf98d0d156970a281e66761b",
      "0x83f9821ef8f66708108df75e8adfdffe8427c3a8",
      "0x697bcadf4094f1948adc3d10e875765a62932157",
      "0x38eed3cceed88f380e436eb21811250797c453c5",
      "0x9f787a6783fb1265848404af2886709515991583",
      "0x18fffe83bc34d98aafe594d81e07ab6b3bbbaa41",
      "0x7d8504c239f951d944d23b7ad9bededc4d4512d9",
      "0x84561f3d108ae801da597d08e311ee84a838552e",
      "0x983d6466fac5b2afe57e070283a4932a1bd0508f",
      "0x14977b0dbe7e155f9907effecbb70c9b7a05e737",
      "0x14977b0dbe7e155f9907effecbb70c9b7a05e737",
      "0x00e42ed4f0815841aef328f294c8fd6100bf6bea",
      "0x64b61e3b8F1d5cb92641c92A447b2BB43972450D",
      "0x1De45d6811d6796178C0adE37516E510C1E07f77",
      "0x36eee7D790a5B9e8811fB0C570c883997069DF49",
      "0xD4Ca157d6ee33a5d0eB811535577cC716b876304",
      "0xD20f5fF0af177De3501AfF487ecBae7A5826BDc1",
      "0x92d35563EA7a4DA571CEA4c15b59f8A9A0975491",
      "0x85908923fB82a081103a8817EF52C6ED59B7ae1B",
      "0xAccA520CA226b3c2647b8adC9190E21169cBd7d3",
      "0x49cd0640Bb99e2e410A64E943a65e0091646b7D2",
      "0x1975638d2dfdeee04d11adf6350187af9996dc7c",
      "0x02e06bec5942d168fba8149a692ac0a12e90b5a2",
      "0x8ef17f29638E00180D6C154347e9Ba96964F7Aea",
    ];

    wallets = wallets.map((wallet) => wallet.toUpperCase());

    if (wallets.includes(walletAddressU)) {
      return true;
    }

    let walletWhitelisted = await redis.get("address");
    walletWhitelisted = JSON.parse(walletWhitelisted);

    walletWhitelisted = walletWhitelisted.map((wallet) => wallet.toUpperCase());

    if (walletWhitelisted.includes(walletAddressU)) {
      return true;
    }

    // let res = await eth_alchemy.nft.verifyNftOwnership(walletAddress, [
    //   "0x3Fe1a4c1481c8351E91B64D5c398b159dE07cbc5",
    // ]);

    // res = Object.values(res);

    // for (let i = 0; i < res.length; i++) {
    //   if (res[i]) {
    //     return true;
    //   }
    // }

    return false;
  } catch (err) {
    console.log(err);
  }
};

module.exports = getIsWhitelisted;
