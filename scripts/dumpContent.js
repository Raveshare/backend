const db = require("../utils/db/db");
const { content, collections } = require("../schema/schema");
const fs = require("fs");

const dumpContent = async (fileName, collectionDetails) => {

    // await db.sync({ force: true });

    let collection = await collections.findOne({
        where: {
            address: collectionDetails.address,
        },
    });

    if (!collection) {
        collection = await collections.create(collectionDetails);
    }

    let data = JSON.parse(fs.readFileSync("./dumpdata/" + fileName));
    for (let i = 1; i < data.length; i++) {
        let contentData = data[i];
        let contentDetails = {
            tokenId: contentData.tokenId,
            title: contentData.title,
            description: contentData.description,
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