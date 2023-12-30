const { toBigNumber } = require("@metaplex-foundation/js");
const metaplex = require("../../../../utils/metaplex");
const { Keypair, PublicKey } = require("@solana/web3.js");
const bs58 = require("bs58");
const web3js = require("@solana/web3.js");

const LENSPOST_WALLET = process.env.LENSPOST_SOLANA_WALLET;
const wallet = Keypair.fromSecretKey(bs58.decode(LENSPOST_WALLET));

async function mintMasterEdition(masterEditionSettings, payer) {
  payer = "8aAi7EV7yyLuJEGtTNmfiZdPy6C5pZctf3D1P2b9P4Xs";
  const candyMachineSettings = {
    itemsAvailable: toBigNumber(masterEditionSettings.itemsAvailable), // Collection Size: 3
    sellerFeeBasisPoints: masterEditionSettings.sellerFeeBasisPoints, // 10% Royalties on Collection
    symbol: masterEditionSettings.symbol,
    maxEditionSupply: toBigNumber(masterEditionSettings.itemsAvailable), // 0 reproductions of each NFT allowed
    isMutable: "false",
    creators: masterEditionSettings.creators,
    collection: {
      address: new PublicKey("zahTJa64eLoisdEryax5PUq7jvaCZqAVh5D9zSQBuMT"), // Can replace with your own NFT or upload a new one
      updateAuthority: wallet
    },
  };

  const txBuilder = await metaplex
    .candyMachines()
    .builders()
    .create(candyMachineSettings);

  const blockhashWithExpiryBlockHeight = await metaplex
    .rpc()
    .getLatestBlockhash();

  let tx = txBuilder.toTransaction(blockhashWithExpiryBlockHeight);
  tx.feePayer = new PublicKey(payer);
  tx.partialSign(wallet);

  console.log(tx);

  return {
    tx: tx
      .serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      })
      .toString("base64"),
  };
}

module.exports = mintMasterEdition;
