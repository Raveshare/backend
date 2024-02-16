const { ethers } = require('ethers');
const rpcURL = 'https://rpc.zora.energy';
const provider = new ethers.JsonRpcProvider(rpcURL);
async function getUserBalance(address) {
  const balance = await provider.getBalance(address);
  console.log(`Balance of ${address}:`, ethers.formatEther(balance), 'ETH');
  return  ethers.formatEther(balance)
}


module.exports = getUserBalance;