const {
  zoraNftCreatorV1Config,
  erc721DropABI,
} = require("@zoralabs/zora-721-contracts");
const { ethers } = require("ethers");
const dotenv = require("dotenv");
const { parseEther } = require("viem");
const prisma = require("../../prisma");
dotenv.config();

let abi = erc721DropABI;
let provider = new ethers.JsonRpcProvider("https://rpc.zora.energy");

let { BaseAbi, BaseContractAddress } = require("./BaseContract.js");

const mintFee = parseEther("0.000777");
const quantity = 1;
const value = mintFee * BigInt(quantity);
const comment = "gm gm!, mint from raveshare";
const mintReferralAddress = process.env.MINT_REFERRAL_ADDRESS;

async function mintToERC721(frameId,recipientAddress) {

  let frame = await prisma.frames.findUnique({
    where: {
      id: frameId,
    },
    select: {
      tokenUri: true,
      owner: true
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
