const updateEVMNFTs = require("./evm/updateEVMNFTs");
const updateSolanaNFTs = require("./solana/updateSolanaNFTs");
const nftSchema = require("../schema/nftSchema");
const uploadImageFromLinkToS3 = require("./uploadImageFromLinkToS3");

const prisma = require("../../src/prisma");

async function updateNFTsForOwner(owner) {
  try {
    let evm_address = owner.evm_address;
    let solana_address = owner.solana_address;

    console.log(evm_address, solana_address);
    
    if (solana_address) updateSolanaNFTs(solana_address);
    if (evm_address) updateEVMNFTs(evm_address);

    return

    try {
      await prisma.nftData.create({
        data: {
          ownerAddress: evm_address,
          tokenId: nft.tokenId,
          title: nft.name,
          description: nft.description,
          openseaLink: `https://opensea.io/assets/${nft.contractAddress}/${nft.tokenId}`,
          permaLink: nft.originalContent.uri,
          address: nft.contractAddress,
        },
      });
    } catch (e) {
      console.log(nft.name);
    }

    for (let i = 0; i < latestNFTs.length; i++) {
      let nft = latestNFTs[i];

      let nftInstance = await nftSchema.findOne({
        where: {
          tokenId: nft.tokenId,
          address: nft.contractAddress,
        },
      });

      if (!nftInstance) continue;
      if (nftInstance.imageURL) continue;

      let res = await uploadImageFromLinkToS3(
        nftInstance.permaLink,
        ownerAddress,
        nft.name + Date.now()
      );

      if (!res) continue;

      try {
        nftInstance.dimensions = res.dimensions;
        nftInstance.imageURL = res.s3Link;

        await nftInstance.save();
      } catch (e) {
        console.log(nftInstance.permaLink);
      }
    }

    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}

module.exports = updateNFTsForOwner;
