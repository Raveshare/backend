const mintCompressedNft = require("./solana/mintCompressedNFT");

const uploadToSolana = async (postMetadata, owner, canvasParams) => {

  let solana_address = owner.solana_address;

  let assetId = await mintCompressedNft(postMetadata, solana_address, canvasParams);

  return {
    txHash: `http://xray.helius.xyz/token/${assetId}`,
  };
};

module.exports = uploadToSolana;
