const { Alchemy, Network } = require("alchemy-sdk");
const prisma = require("../prisma");
const { getCache, setCache } = require("../functions/handleCache");

const config = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};
const alchemy = new Alchemy(config);

const updateNFTOwnerForPublication = async (contractAddress, canvasId) => {
  const { owners } = await alchemy.nft.getOwnersForContract(contractAddress);
  let canvasownerCache = getCache(`canvas_${canvasId}`);
  let canvas;

  if (canvasownerCache) {
    canvas = JSON.parse(canvasownerCache);
  } else {
    canvas = await canvasSchema.findOne({
      where: {
        id: canvasId,
      },
    });

    await setCache(`canvas_${canvasId}`, JSON.stringify(canvas));
  }

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
