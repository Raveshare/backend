const { Connection, Keypair, PublicKey } = require("@solana/web3.js");
const {
  Metaplex,
  keypairIdentity,
} = require("@metaplex-foundation/js");
const bs58 = require("bs58");

const HELIUS_RPC_URL = process.env.HELIUS_RPC_URL;

const LENSPOST_WALLET=process.env.LENSPOST_SOLANA_WALLET;


const connection = new Connection(HELIUS_RPC_URL, {
  commitment: "finalized",
});

const metaplexClient = Metaplex.make(connection).use(keypairIdentity(Keypair.fromSecretKey(bs58.decode(LENSPOST_WALLET))));

module.exports = metaplexClient;