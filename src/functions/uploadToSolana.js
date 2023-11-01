const mintCompressedNft = require("./solana/mintCompressedNFT");
const mintMasterEdition = require("./solana/master_edition/mintMasterEdition");

const uploadToSolana = async (postMetadata, owner, canvasParams, type) => {
  let solana_address = owner.solana_address;

  if (type === "cnft") {
    let assetId = await mintCompressedNft(
      postMetadata,
      solana_address,
      canvasParams
    );

    return assetId;
  } else if (type === "master") {
    let assetId = await mintMasterEdition(
      postMetadata,
      solana_address,
      canvasParams
    );

    return assetId;
  }
};

module.exports = uploadToSolana;
