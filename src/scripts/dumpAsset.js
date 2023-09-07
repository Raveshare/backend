const fs = require('fs');
const assetSchema = require('../schema/assetSchema');

async function dumpAsset(name) {
    let assets = fs.readFileSync('./dumpdata/assets/' + name);
    assets = JSON.parse(assets);

    for (let i = 0; i < assets.length; i++) {
        const asset = assets[i];
        console.log(asset);
        await assetSchema.create(asset);
    }
}

module.exports = dumpAsset;