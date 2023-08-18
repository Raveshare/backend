const fs = require('fs');
const assetSchema = require('../schema/assetSchema');

async function deleteAsset (ownerAddress) {
    assetSchema.destroy({
        where: {
            ownerAddress: ownerAddress
        },
    })
}

module.exports = deleteAsset;