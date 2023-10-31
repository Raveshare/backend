const getWhoCollectedPublication =
  require("../lens/api").getWhoCollectedPublication;
const prisma = require("../prisma");

const updateCollectsForPublication = async (publicationId, canvasId) => {
  let offset = 0;
  let addresses = [];

  while (true) {
    let request = {
      publicationId,
      cursor: offset,
    };

    let { items, pageInfo } = await getWhoCollectedPublication(request);
    offset = JSON.parse(pageInfo.next);

    for (let i = 0; i < items.length; i++) {
      addresses.push(items[i].address);
    }

    if (!offset) {
      break;
    }
  }

  let canvas = await prisma.canvases.findUnique({
    where: {
      id: canvasId,
    },
  });

  let allowList = canvas.allowList;
  allowList = allowList.concat(addresses);
  
  let gatedWith = canvas.gatedWith;
  if(!gatedWith.includes(publicationId)) 
  gatedWith = gatedWith.concat(publicationId);

  await prisma.canvases.update({
    where: {
      id: canvasId,
    },
    data: {
      allowList,
      gatedWith,
    },
  });

  return addresses;
};

module.exports = updateCollectsForPublication;
