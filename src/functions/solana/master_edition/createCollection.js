const { Connection, Keypair, PublicKey } = require("@solana/web3.js");
const {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
  toMetaplexFile,
  toBigNumber,
  CreateCandyMachineInput,
  DefaultCandyGuardSettings,
  CandyMachineItem,
  toDateTime,
  sol,
  TransactionBuilder,
  CreateCandyMachineBuilderContext,
} = require("@metaplex-foundation/js");
const bs58 = require("bs58");
const metaplex = require("../../../utils/metaplex");

const LENSPOST_WALLET = process.env.LENSPOST_SOLANA_WALLET;

console.log("LENSPOST_WALLET", LENSPOST_WALLET);
const wallet = Keypair.fromSecretKey(bs58.decode(LENSPOST_WALLET));

// lENSPOST_collection_address=zahTJa64eLoisdEryax5PUq7jvaCZqAVh5D9zSQBuMT

const createCollection = async () => {
  const nft = await metaplex.nfts().create({
    name: "Lenspost Remix Collection",
    uri: "https://arweave.net/maMg6dqFNnSzwiDlYfbwnqcjmWDrX9ydhxQkywiBa9Q",
    sellerFeeBasisPoints: 500,
    isCollection: true,
    updateAuthority: wallet,
  });

  console.log(nft);
};
module.exports = createCollection;
