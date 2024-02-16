const { ethers } = require("ethers");
let NODE_ENV = process.env.NODE_ENV;

let rpc =
  NODE_ENV === "production"
    ? `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_BASE_API_KEY}`
    : "https://sepolia.base.org";

let provider = new ethers.JsonRpcProvider(rpc);

async function getUserBalance(address) {
  const balance = await provider.getBalance(address);
  console.log(`Balance of ${address}:`, ethers.formatEther(balance), "ETH");
  return ethers.formatEther(balance);
}

module.exports = getUserBalance;
