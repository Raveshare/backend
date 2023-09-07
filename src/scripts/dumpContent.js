const db = require("../utils/db/db");
const { content, collections } = require("../schema/schema");
const fs = require("fs");

const dumpContent = async (fileName) => {
  let data = JSON.parse(fs.readFileSync("./dumpdata/collections/" + fileName));

  collectionDetails = data[0];

  let collection = await collections.findOne({
    where: {
      address: collectionDetails.address,
    },
  });

  if (!collection) {
    collection = await collections.create(collectionDetails);
  }

  for (let i = 1; i < data.length; i++) {
    let contentData = data[i];
    let contentDetails = {
      tokenId: contentData.tokenId,
      title: contentData.title,
      description: contentData.description.length > 200 ? contentData.description.substring(0, 200) : contentData.description,
      edition: contentData.edition,
      openseaLink: contentData.openSeaLink,
      ipfsLink: contentData.ipfsLink,
      imageURL: contentData.imageURL,
    };
    let contentInstance = await content.create(contentDetails);
    await collection.addContents(contentInstance);
    if (i % 100 == 0) {
      console.log("Done with " + i + " records");
    }
  }

  return "Done";
};

// example usage
// dumpContent("wagmi.json", collectionDetails);

module.exports = dumpContent;
