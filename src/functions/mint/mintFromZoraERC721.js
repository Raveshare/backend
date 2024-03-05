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
const { zoraNftCreatorV1Config } = require("@zoralabs/zora-721-contracts");
const dotenv = require("dotenv");

const prisma = require("../../prisma");
dotenv.config();

let ZORA_ABI = zoraNftCreatorV1Config.abi;

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

async function mintAsZoraERC721(userId, chainId, args) {
  try {
    let ZORA_CONTRACT_ADDRESS = zoraNftCreatorV1Config.address[chainId];

    let userWalletPvtKey = await prisma.user_funds.findUnique({
      where: {
        userId: userId,
      },
      select: {
        wallet_pvtKey: true,
      },
    });

    let account = privateKeyToAccount(userWalletPvtKey.wallet_pvtKey);

    let walletClient = createWalletClient({
      account,
      chain: chainIdToChain[chainId],
      transport: http(chainConfig[chainId]),
    });

    let publicClient = createPublicClient({
      chain: chainIdToChain[chainId],
      transport: http(chainConfig[chainId]),
    });

    let { result } = await publicClient.simulateContract({
      abi: ZORA_ABI,
      address: ZORA_CONTRACT_ADDRESS,
      functionName: "createEditionWithReferral",
      args: args,
    });

    console.log(result);

    let drop_address = result;

    let hash = await walletClient.writeContract({
      abi: ZORA_ABI,
      address: ZORA_CONTRACT_ADDRESS,
      functionName: "createEditionWithReferral",
      args: args,
    });

    return {
      status: 200,
      hash: hash,
      contract : drop_address
    };
  } catch (error) {
    console.log(error);
    return {
      status: 400,
      message: error,
    };
  }
}

module.exports = mintAsZoraERC721;
