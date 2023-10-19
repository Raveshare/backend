const metaplex = require("../../../utils/metaplex");

async function mintMasterEdition(masterEditionSettings) {
  const candyMachineSettings = {
    itemsAvailable: toBigNumber(masterEditionSettings.itemsAvailable), // Collection Size: 3
    sellerFeeBasisPoints: masterEditionSettings.sellerFeeBasisPoints, // 10% Royalties on Collection
    symbol: masterEditionSettings.symbol,
    maxEditionSupply: toBigNumber(masterEditionSettings.maxEditionSupply), // 0 reproductions of each NFT allowed
    isMutable: masterEditionSettings.isMutable,
    creators: masterEditionSettings.creators,
    collection: {
      address: new PublicKey(COLLECTION_NFT_MINT), // Can replace with your own NFT or upload a new one
      updateAuthority: WALLET,
    },
  };
  const { candyMachine } = await metaplex.candyMachines().builders().create(
    candyMachineSettings
  );
}

module.exports = mintMasterEdition;
