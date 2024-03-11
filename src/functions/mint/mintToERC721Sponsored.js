const { createWalletClient, http } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
const { base, baseSepolia } = require("viem/chains");
const dotenv = require("dotenv");

const prisma = require("../../prisma");
dotenv.config();

let NODE_ENV = process.env.NODE_ENV;

let rpc =
  NODE_ENV === "production"
    ? `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_BASE_API_KEY}`
    : "https://sepolia.base.org";

let { BaseAbi, BaseContractAddress } = require("./BaseContract.js");

let account = privateKeyToAccount(process.env.SPONSOR_WALLET_KEY);

let walletClient = createWalletClient({
  account,
  chain: NODE_ENV === "production" ? base : baseSepolia,
  transport: http(rpc),
});

async function mintToERC721Sponsored(frameId, recipientAddress) {
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

  try {
    let hash = await walletClient.writeContract({
      abi: BaseAbi,
      address: BaseContractAddress,
      functionName: "mint",
      args: [recipientAddress, frame.tokenUri],
    });

    await prisma.user_funds.update({
      where: {
        userId: owner.id,
      },
      data: {
        sponsored: userWalletPvtKey.sponsored - 1,
      },
    });

    return {
      status: 200,
      hash: hash,
    };
  } catch (error) {
    return {
      status: 400,
      message: "Gas not enough",
    };
  }
}

module.exports = mintToERC721Sponsored;
