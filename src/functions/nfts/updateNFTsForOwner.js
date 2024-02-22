const updateEVMNFTs = require("./evm/updateEVMNFTs");
const updateSolanaNFTs = require("./solana/updateSolanaNFTs");
const uploadImageFromLinkToS3 = require("../image/uploadImageFromLinkToS3");
const prisma = require("../../prisma");

async function updateNFTsForOwner(owner) {
  try {
    const { user_id, evm_address, solana_address } = owner;

    let nfts = [];
    if (solana_address)
      nfts = nfts.concat(await updateSolanaNFTs(user_id, solana_address));
    if (evm_address)
      nfts = nfts.concat(await updateEVMNFTs(user_id, evm_address));

    let updatedNFT = nfts.map(({ imageLink, ...rest }) => {
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
      console.log(`Error saving nfts for ${user_id}`);
    }

    await processInBatches(nfts, 10, uploadAndUpdateNFT);

    console.log(`NFTs update ends for ${user_id} at`, new Date().toISOString());
    return true;
  } catch (e) {
    return false;
  }
}

async function processInBatches(items, batchSize, processFunction) {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await Promise.all(batch.map((item) => processFunction(item)));
  }
}

async function uploadAndUpdateNFT(nft) {
  const imagePath = getImagePath(nft);
  const result = await uploadImageFromLinkToS3(
    nft.imageLink || nft.permaLink,
    nft.user_id,
    imagePath
  );

  if (result == "") {
    await prisma.nftData.delete({
      where: {
        tokenId: nft.tokenId,
        address: nft.address,
        chainId: nft.chainId,
      },
    });
  } else {
    nft.dimensions = result.dimensions;
    nft.imageURL = result.s3Link;
    try {
      await prisma.nftData.updateMany({
        where: {
          tokenId: nft.tokenId,
          address: nft.address,
          chainId: nft.chainId,
        },
        data: { dimensions: nft.dimensions, imageURL: nft.imageURL },
      });
    } catch (error) {
      console.error("Error in updating NFT data");
    }
  }
}

function getImagePath(nft) {
  const chainPath = {
    2: "sol/",
    7777777: "zora/",
    8453: "base",
    137: "matic/",
    10: "optimism/",
    default: "eth/",
  };
  return `${chainPath[nft.chainId] || chainPath.default}${
    nft.title
  }${Date.now()}`;
}

module.exports = updateNFTsForOwner;
