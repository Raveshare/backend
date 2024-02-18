const dotenv = require("dotenv");

const { createPublicClient, http, createWalletClient } = require("viem");
const { base, baseSepolia } = require("viem/chains");
const { publicActionsL2 } = require("viem/op-stack");
const { privateKeyToAccount } = require("viem/accounts");

const prisma = require("../../prisma");
dotenv.config();

let NODE_ENV = process.env.NODE_ENV;

let rpc =
  NODE_ENV === "production"
    ? `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_BASE_API_KEY}`
    : "https://sepolia.base.org";

const publicClient = createPublicClient({
  chain: NODE_ENV === "production" ? base : baseSepolia,
  transport: http(rpc),
}).extend(publicActionsL2());

async function withdrawFunds(userId, recipientAddress, amount) {
  try {
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

    let walletClient = createWalletClient({
      chain: NODE_ENV === "production" ? base : baseSepolia,
      transport: http(rpc),
      account: privateKeyToAccount(userWalletPvtKey.wallet_pvtKey),
    });

    let balance = await publicClient.getBalance({
      address: walletClient.account.address,
      blockTag: "safe",
    });

    const fee = await publicClient.estimateTotalFee({
      account: walletClient.account,
    });

    if (fee > balance) {
      return {code : 503 , error : "Insufficient funds"};
    }

    let transfer_amount = balance - fee;

    let hash = await walletClient.sendTransaction({
      to: recipientAddress,
      value: transfer_amount,
    });

    return {
      code : 200,
      success : hash
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

module.exports = withdrawFunds;
