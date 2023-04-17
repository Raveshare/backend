const db = require("../utils/db/db");
const { content, collections } = require("../schema/schema");
const fs = require("fs");

const dumpContent = async (fileName, collectionDetails) => {

    await db.sync({ force: true });

    let collection = await collections.findOne({
        where: {
            address: collectionDetails.address,
        },
    });

    if (!collection) {
        collection = await collections.create(collectionDetails);
    }

    let data = JSON.parse(fs.readFileSync("../dumpdata/" + fileName));
    for (let i = 1; i < data.length; i++) {
        let contentData = data[i];
        let contentDetails = {
            tokenId: contentData.tokenId,
            title: contentData.title,
            description: contentData.description,
            edition: contentData.edition,
            openseaLink: contentData.openSeaLink,
        };
        let contentInstance = await content.create(contentDetails);
        await collection.addContents(contentInstance);
        if (i % 100 == 0) {
            console.log("Done with " + i + " records");
        }
    }

};

let collectionDetails = {
    address: "0x975d74900ef48F53Fa7d4F3550FA0C89f3B3c1Dc",
    name: "wgmis",
    openseaLink: "https://opensea.io/collection/wgmis",
};

dumpContent("wagmi.json", collectionDetails);