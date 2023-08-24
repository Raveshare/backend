const { Alchemy, Network } = require("alchemy-sdk");
const canvasSchema = require("../schema/canvasSchema");

const config = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};
const alchemy = new Alchemy(config);

const updateNFTOwnerForPublication = async (contractAddress, canvasId) => {
  const { owners } = await alchemy.nft.getOwnersForContract(contractAddress);

  let canvas = await canvasSchema.findOne({
    where: {
      id: canvasId,
    },
  });

  let allowList = canvas.allowList;
  allowList = allowList.concat(owners);
  canvas.allowList = allowList;

  let gatedWith = canvas.gatedWith;
  gatedWith = gatedWith.concat(contractAddress);
  canvas.gatedWith = gatedWith;

  await canvas.save();
  
};

module.exports = updateNFTOwnerForPublication;