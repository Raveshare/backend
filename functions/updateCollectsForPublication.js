const getWhoCollectedPublication =
  require("../lens/api").getWhoCollectedPublication;
const canvasSchema = require("../schema/canvasSchema");

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
      console.log("No more items");
      break;
    }
  }

  let canvas = await canvasSchema.findOne({
    where: {
      id: canvasId,
    },
  });

  let allowList = canvas.allowList;
  allowList = allowList.concat(addresses);
  canvas.allowList = allowList;

  await canvas.save();

  return addresses;
};

module.exports = updateCollectsForPublication;
