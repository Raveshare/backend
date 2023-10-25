const mintCompressedNft = require("./solana/mintCompressedNFT");
const mintMasterEdition = require("./solana/master_edition/mintMasterEdition");

const uploadToSolana = async (postMetadata, owner, canvasParams, type) => {
  let solana_address = owner.solana_address;

  let creatorAddress = canvasParams.creators.map((recipients) => {
    return recipients.address;
  });

  let share =
    creatorAddress.length % 2 == 0
      ? 100 / creatorAddress.length
      : 100 / creatorAddress.length - 1;
  // share = Math.round(share);

  canvasParams.creators = creatorAddress.map((recipients) => {
    return {
      address: recipients,
      share: share,
    };
  });

  canvasParams.creators = !(share == 100)
    ? [
        {
          address: solana_address,
          share: 100,
        },
      ]
    : canvasParams.creators;

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
