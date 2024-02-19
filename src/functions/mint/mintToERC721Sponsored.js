const { ethers } = require("ethers");
const prisma = require("../../prisma");
const dotenv = require("dotenv");
dotenv.config();

let NODE_ENV = process.env.NODE_ENV;

let rpc = NODE_ENV === "production" ? `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_BASE_API_KEY}` : "https://sepolia.base.org";

let provider = new ethers.JsonRpcProvider(rpc);

let { BaseAbi, BaseContractAddress } = require("./BaseContract.js");

let wallet = new ethers.Wallet(process.env.SPONSOR_WALLET_KEY, provider);

const mintedFrame = require("../events/mintedFrame.event");

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
      sponsored: true,
    },
  });

  let contractWithSigner = contract.connect(wallet);
  try {
    const transaction = await contractWithSigner.mint(
      recipientAddress,
      frame.tokenUri
    );

    await prisma.user_funds.update({
      where: {
        userId: owner.id,
      },
      data: {
        sponsored: userWalletPvtKey.sponsored - 1,
      },
    });


    mintedFrame(owner.id , frameId , recipientAddress , false)
    

    return transaction.hash;
  } catch (error) {
    console.error("Error:", error);
  }
}

module.exports = mintToERC721Sponsored;
