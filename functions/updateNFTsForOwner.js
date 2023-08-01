const getNfts = require("../lens/api").getNfts;
const { isEmpty } = require("lodash");
const nftSchema = require("../schema/nftSchema");
const ownerSchema = require("../schema/ownerSchema");
const uploadImageFromLinkToS3 = require("./uploadImageFromLinkToS3");

async function checkIfNFTExists(nft) {
  return await nftSchema.findOne({
    where: {
      tokenId: nft.tokenId,
      address: nft.contractAddress,
    },
  });
}

async function updateNFTsForOwner(ownerAddress) {
  try {
    let owner = await ownerSchema.findOne({
      where: {
        address: ownerAddress,
      },
    });

    let latestNFTs = [];

    let cursor = {};

    let chainIds = [1, 137];

    while (true) {
      let request = {
        ownerAddress: ownerAddress,
        chainIds: chainIds,
        limit: 50,
        cursor: cursor,
      };

      let res;
      try {
        res = await getNfts(request);

        latestNFTs = latestNFTs.concat(res.items);

        cursor = res.pageInfo.next;
      } catch (e) {}

      cursor = JSON.parse(cursor);
      if (!cursor.polygon) chainIds = [1];
      if (!cursor.eth) chainIds = [137];
      if (isEmpty(cursor)) {
        break;
      }
    }

    for (let i = 0; i < latestNFTs.length; i++) {
      let nft = latestNFTs[i];

      if (await checkIfNFTExists(nft)) continue;

      if (!nft.originalContent.uri) continue;

      if (nft.originalContent.uri.includes("ipfs://")) {
        nft.originalContent.uri = nft.originalContent.uri.replace(
          "ipfs://",
          "https://ipfs.io/ipfs/"
        );
      }

      let nftData = {
        tokenId: nft.tokenId,
        title: nft.name,
        description: nft.description,
        openseaLink: `https://opensea.io/assets/${nft.contractAddress}/${nft.tokenId}`,
        permaLink: nft.originalContent.uri,
        address: nft.contractAddress,
      };

      try {
        let nftInstance = await nftSchema.create(nftData);

        await owner.addNftData(nftInstance);
      } catch (e) {
        console.log(nft.name);
      }
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
        nft.name
      );

      console.log(res);

      if(!res) continue;

      try {
      nftInstance.dimensions = res.dimensions;
      nftInstance.imageURL = res.s3Link;

      await nftInstance.save();
      } catch (e) {
        console.log(e);
      }
    }

    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}

module.exports = updateNFTsForOwner;
