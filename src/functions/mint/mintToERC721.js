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

const mintedFrame = require("../events/mintedFrame.event");

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

  let owner = await prisma.owners.findUnique({
    where: {
      evm_address: frame.owner,
    },
  });

  let userWalletPvtKey = await prisma.user_funds.findUnique({
    where: {
      userId: owner.id,
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

    mintedFrame(owner.id , frameId , recipientAddress , false)
    
    return transaction.hash;
  } catch (error) {
    console.error("Error:", error);
    return "Gas not enough"
  }
}

module.exports = mintToERC721;
