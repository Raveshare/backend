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

async function withdrawFunds(userId,recipientAddress, amount) {
  amount = amount | 0;
  let owner = await prisma.owners.findUnique({
    where: {
      id: userId,
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

  let fee = await provider.getFeeData();

  let currentBalance = await wallet.provider.getBalance(wallet.address);

  console.log("Current Balance", currentBalance);

  if (currentBalance < amount + fee) return;

  return

  try {
    let gas = await provider.get
    const transaction = await contractWithSigner.mint(
      recipientAddress,
      frame.tokenUri
    );

    return transaction.hash;
  } catch (error) {
    console.error("Error:", error);
  }
}

module.exports = withdrawFunds;
