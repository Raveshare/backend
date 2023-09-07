const fs = require('fs');
const assetSchema = require('../schema/assetSchema');

async function deleteAsset () {
    assetSchema.destroy({
        where: {},
        truncate: true
    })
}

module.exports = deleteAsset;