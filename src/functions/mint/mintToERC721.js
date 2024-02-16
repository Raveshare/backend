const { ethers } = require("ethers");
const dotenv = require("dotenv");

const prisma = require("../../prisma");
dotenv.config();

let NODE_ENV = process.env.NODE_ENV;

let rpc =
  NODE_ENV === "production"
    ? `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_BASE_API_KEY}`
    : "https://sepolia.base.org";

let provider = new ethers.JsonRpcProvider(rpc);
let { BaseAbi, BaseContractAddress } = require("./BaseContract.js");

async function mintToERC721(frameId, recipientAddress) {
  let frame = await prisma.frames.findUnique({
    where: {
      id: frameId,
    },
    select: {
      tokenUri: true,
      owner: true,
    },
  });

  let userWalletPvtKey = await prisma.user_funds.findUnique({
    where: {
      owner: {
        evm_address: {
          contains: frame.owner,
        },
      },
    },
    select: {
      wallet_pvtKey: true,
    },
  });

  let wallet = new ethers.Wallet(userWalletPvtKey.wallet_pvtKey, provider);
  let contract = new ethers.Contract(BaseContractAddress, BaseAbi, wallet);
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

module.exports = mintToERC721;
