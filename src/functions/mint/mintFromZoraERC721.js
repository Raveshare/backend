const { createWalletClient, http, createPublicClient } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
const {
  base,
  mainnet,
  sepolia,
  zora,
  baseGoerli,
  optimismGoerli,
  optimism,
  zoraSepolia,
} = require("viem/chains");
const { erc721DropABI } = require("@zoralabs/zora-721-contracts");
const dotenv = require("dotenv");

const prisma = require("../../prisma");
dotenv.config();

let ERC721_ABI = erc721DropABI;

let LENSPOST_SPONSOR_WALLET = privateKeyToAccount(
  process.env.SPONSOR_WALLET_KEY
);

const chainConfig = {
  1: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
  7777777: "https://rpc.zora.energy",
  8453: `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_BASE_API_KEY}`,
  10: `https://optimism-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
  11155111: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
  999999999: "https://sepolia.rpc.zora.energy",
  84531: `https://goerli.base.org`,
  420: `https://optimism-goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
};

const chainIdToChain = {
  1: mainnet,
  7777777: zora,
  8453: base,
  10: optimism,
  11155111: sepolia,
  999999999: zoraSepolia,
  84531: baseGoerli,
  420: optimismGoerli,
};

async function mintFromZoraERC721(
  userId,
  chainId,
  contractAddress,
  recipient,
  sponsored
) {
  try {
    let userWalletPvtKey = await prisma.user_funds.findUnique({
      where: {
        userId: userId,
      },
      select: {
        wallet_pvtKey: true,
      },
    });

    let account = privateKeyToAccount(userWalletPvtKey.wallet_pvtKey);

    let walletClient;
    if (sponsored) {
      walletClient = createWalletClient({
        account: LENSPOST_SPONSOR_WALLET,
        chain: chainIdToChain[chainId],
        transport: http(chainConfig[chainId]),
      });
    } else {
      walletClient = createWalletClient({
        account,
        chain: chainIdToChain[chainId],
        transport: http(chainConfig[chainId]),
      });
    }

    let publicClient = createPublicClient({
      chain: chainIdToChain[chainId],
      transport: http(chainConfig[chainId]),
    });

    let { result } = await publicClient.simulateContract({
      abi: ERC721_ABI,
      address: contractAddress,
      functionName: "adminMint",
      args: [recipient, 1],
      account: account,
    });

    let hash = await walletClient.writeContract({
      abi: ERC721_ABI,
      address: contractAddress,
      functionName: "adminMint",
      args: [recipient, 1],
    });

    return {
      status: 200,
      hash: hash,
      tokenId: result,
    };
  } catch (error) {
    console.log(error);
    return {
      status: 400,
      message: error,
    };
  }
}

module.exports = mintFromZoraERC721;
