const updateEVMNFTs = require("./evm/updateEVMNFTs");
const updateSolanaNFTs = require("./solana/updateSolanaNFTs");
const updateZoraNFTs = require("./evm/updateZoraNFTs");
const uploadImageFromLinkToS3 = require("../image/uploadImageFromLinkToS3");
const prisma = require("../../prisma");

async function updateNFTsForOwner(owner) {
  try {
    let user_id = owner.user_id;
    let evm_address = owner.evm_address;
    let solana_address = owner.solana_address;

    let nfts = [];

    if (solana_address)
      nfts = nfts.concat(await updateSolanaNFTs(user_id, solana_address));
    if (evm_address) {
      nfts = nfts.concat(await updateEVMNFTs(user_id, evm_address));
      nfts = nfts.concat(await updateZoraNFTs(user_id, evm_address));
    }

    let updatedNFT = nfts.map((item) => {
      const { imageLink, ...rest } = item; // Use object destructuring to remove 'ownership' property
      rest.description = rest.description?.replace(/[^\x00-\x7F]+/g, "");
      return rest;
    });
    try {
      let res = await prisma.nftData.createMany({
        data: updatedNFT,
        skipDuplicates: true,
      });
      console.log(res.count)
    } catch (e) {
      console.error(e);
      console.log(`Error saving nfts for ${owner.user_id}`);
    }

    for (let i = 0; i < nfts.length; i++) {
      let nft = nfts[i];

      let res = await uploadImageFromLinkToS3(
        nft.imageLink || nft.permaLink,
        user_id,
        (nft.chainId == 2
          ? "sol/"
          : nft.chainId == 7777777
          ? "zora/"
          : nft.chainId == 8453
          ? "base"
          : nft.chainId == 137
          ? "matic/"
          : "eth/") +
          nft.title +
          Date.now()
      );

      if (!res) continue;

      try {
        nft.dimensions = res.dimensions;
        nft.imageURL = res.s3Link;

        await prisma.nftData.updateMany({
          where: {
            // id: nft.id,
            tokenId: nft.tokenId,
            address: nft.address,
            chainId: nft.chainId,
          },
          data: {
            dimensions: nft.dimensions,
            imageURL: nft.imageURL,
          },
        });
      } catch (e) {
        console.log(e);
        console.log(nft.tokenId, nft.address);
      }
    }

    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}

module.exports = updateNFTsForOwner;