const fs = require("fs");
const nftSchema = require("../schema/nftSchema");

async function deleteNFT(ownerAddress) {
  nftSchema.destroy({
    where: {
      ownerAddress
    },
    truncate: true,
  });
}

module.exports = deleteNFT;
