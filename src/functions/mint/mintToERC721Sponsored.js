const {
  zoraNftCreatorV1Config,
  erc721DropABI,
} = require("@zoralabs/zora-721-contracts");
const { ethers } = require("ethers");
const dotenv = require("dotenv");
const { parseEther } = require("viem");
dotenv.config();

let abi = erc721DropABI;
let provider = new ethers.JsonRpcProvider("https://rpc.zora.energy");

const mintFee = parseEther("0.000777");
const quantity = 1;
const value = mintFee * BigInt(quantity);
const comment = "gm gm!, mint from raveshare";
const mintReferralAddress = process.env.MINT_REFERRAL_ADDRESS;
let wallet = new ethers.Wallet(process.env.SPONSOR_WALLET_KEY, provider);

async function mintToERC721Sponsored(zoraContract, recipientAddress) {
  let contract = new ethers.Contract(zoraContract, abi, wallet);
  let contractWithSigner = contract.connect(wallet);
  try {
    const transaction = await contractWithSigner.mintWithRewards(
      recipientAddress,
      BigInt(quantity),
      comment,
      mintReferralAddress,
      {
        value,
      }
    );
    await transaction.wait();


    console.log("Transaction hash:", transaction.hash);
    console.log("Transaction completed.");

    return transaction.hash;
  } catch (error) {
    console.error("Error:", error);
  }
}

module.exports = mintToERC721Sponsored;
