const { Alchemy, Network } = require("alchemy-sdk");

const eth_config = {
  apiKey: process.env.ALCHEMY_API_KEY, // Replace with your API key
  network: Network.ETH_MAINNET, // Replace with your network
};

const eth_alchemy = new Alchemy(eth_config);
// eth_alchemy.nft.verifyNftOwnership

const getIsWhitelisted = async (walletAddress) => {
  try {
    let wallets = [
      "0x0cf97e9c28c5b45c9dc20dd8c9d683e0265190cb",
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
    ];

    if (wallets.includes(walletAddress)) {
      console.log("true");
      return true;
    }

    console.log("walletAddress", walletAddress);

    let res = await eth_alchemy.nft.verifyNftOwnership(walletAddress, [
      "0x3Fe1a4c1481c8351E91B64D5c398b159dE07cbc5",
    ]);

    res = Object.values(res);

    console.log("res", res);

    for (let i = 0; i < res.length; i++) {
      if (res[i]) {
        return true;
      }
    }

    return false;
  } catch (err) {
    console.log(err);
  }
};

module.exports = getIsWhitelisted;
