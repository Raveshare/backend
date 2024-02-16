const { ethers } = require("ethers");
const prisma = require("../../prisma");
const dotenv = require("dotenv");
dotenv.config();

let NODE_ENV = process.env.NODE_ENV;

let rpc = NODE_ENV === "production" ? `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_BASE_API_KEY}` : "https://sepolia.base.org";

let provider = new ethers.JsonRpcProvider(rpc);

let { BaseAbi, BaseContractAddress } = require("./BaseContract.js");

let wallet = new ethers.Wallet(process.env.SPONSOR_WALLET_KEY, provider);

async function mintToERC721Sponsored(frameId, recipientAddress) {
  let contract = new ethers.Contract(BaseContractAddress, BaseAbi, wallet);

  let frame = await prisma.frames.findUnique({
    where: {
      id: frameId,
    },
    select: {
      tokenUri: true,
      owner: true,
    },
  });

  let contractWithSigner = contract.connect(wallet);
  try {
    const transaction = await contractWithSigner.mint(
      recipientAddress,
      frame.tokenUri
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
