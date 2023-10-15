const mintCompressedNft = require("./solana/mintCompressedNFT");

const uploadToSolana = async (postMetadata, owner, canvasParams) => {
  let solana_address = owner.solana_address;

  let creatorAddress = canvasParams.creators.map((recipients) => {
    return recipients.address;
  });

  console.log("creatorAddress", creatorAddress);
  // let share = 100 / creatorAddress.length;
  let share = (creatorAddress.length % 2 == 0) ? (100 / creatorAddress.length) : (100 / creatorAddress.length - 1);
  // share = Math.round(share);


  canvasParams.creators = creatorAddress.map((recipients) => {
    return {
      address: recipients,
      share: share,
    };
  });

  // console.log("canvasParams", canvasParams);
  // return;

  let assetId = await mintCompressedNft(
    postMetadata,
    solana_address,
    canvasParams
  );

  return assetId;
};

module.exports = uploadToSolana;
