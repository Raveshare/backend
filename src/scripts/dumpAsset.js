const fs = require('fs');
const assetSchema = require('../schema/assetSchema');

async function dumpAsset(name) {
    let assets = fs.readFileSync('./src/dumpdata/assets/' + name);
    assets = JSON.parse(assets);

    await assetSchema.bulkCreate(assets);

}

module.exports = dumpAsset;