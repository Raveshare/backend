const updateEVMNFTs = require("./evm/updateEVMNFTs");
const updateSolanaNFTs = require("./solana/updateSolanaNFTs");
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
    }

    let updatedNFT = nfts.map((item) => {
      const { imageLink, ...rest } = item; // Use object destructuring to remove 'ownership' property
      rest.description = rest.description?.replace(/[^\x00-\x7F]+/g, "");
      return rest;
    });
    try {
      await prisma.nftData.createMany({
        data: updatedNFT,
        skipDuplicates: true,
      });
    } catch (e) {
      console.error(e);
      console.log(`Error saving nfts for ${owner.user_id}`);
    }

    let uploadPromises = [];

    for (let i = 0; i < nfts.length; i++) {
      let nft = nfts[i];
      let imagePath =
        (nft.chainId == 2
          ? "sol/"
          : nft.chainId == 7777777
          ? "zora/"
          : nft.chainId == 8453
          ? "base"
          : nft.chainId == 137
          ? "matic/"
          : nft.chainId == 10
          ? "optimism/"
          : "eth/") +
        nft.title +
        Date.now();

      uploadPromises.push(
        uploadImageFromLinkToS3(
          nft.imageLink || nft.permaLink,
          user_id,
          imagePath
        )
      );
    }

    const results = await Promise.all(uploadPromises);

    for (let index = 0; index < results.length; index++) {
      const res = results[index];
      if (res == "") {
        await prisma.nftData.delete({
          where: {
            tokenId: nfts[index].tokenId,
            address: nfts[index].address,
            chainId: nfts[index].chainId,
          },
        });
        continue;
      }

      let nft = nfts[index];
      nft.dimensions = res.dimensions;
      nft.imageURL = res.s3Link;

      try {
        await prisma.nftData.updateMany({
          where: {
            tokenId: nft.tokenId,
            address: nft.address,
            chainId: nft.chainId,
          },
          data: {
            dimensions: nft.dimensions,
            imageURL: nft.imageURL,
          },
        });
      } catch (error) {
        console.error("Error in updating NFT data");
      }
    }

    console.log(`NFTs update ends for ${user_id} at`, new Date().toISOString());
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = updateNFTsForOwner;
