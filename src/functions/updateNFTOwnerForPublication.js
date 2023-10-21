const { Alchemy, Network } = require("alchemy-sdk");
const prisma = require("../prisma");

const config = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};
const alchemy = new Alchemy(config);

const updateNFTOwnerForPublication = async (contractAddress, canvasId) => {
  const { owners } = await alchemy.nft.getOwnersForContract(contractAddress);

  // TODO: cache
  let canvas = await prisma.canvases.findUnique({
    where: {
      id: canvasId,
    },
  });

  let allowList = canvas.allowList;
  allowList = allowList.concat(owners);

  let gatedWith = canvas.gatedWith;
  if (!gatedWith.includes(contractAddress))
    gatedWith = gatedWith.concat(contractAddress);

  await prisma.canvases.update({
    where: {
      id: canvasId,
    },
    data: {
      allowList,
      gatedWith,
    },
  });
};

module.exports = updateNFTOwnerForPublication;
