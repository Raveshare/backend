const getNfts = require("../../lens/api").getNfts;
const { isEmpty } = require("lodash");
const prisma = require("../../prisma");
const convertToPng = require("../helper/convertToPng");
const NODE_ENV = process.env.NODE_ENV;

// TODO: cache this
async function checkIfNFTExists(nft) {
  return !isEmpty(
    await prisma.nftData.findMany({
      where: {
        tokenId: nft.tokenId,
        address: nft.contractAddress,
        chainId: nft.chainId,
      },
    })
  );
}

async function updateEVMNFTs(user_id,evm_address) {
  let latestNFTs = [];

  let cursor = {};

  let chainIds = [137];

  if(NODE_ENV === "production") chainIds = [1,137];

  while (true) {
    let request = {
      ownerAddress: evm_address,
      chainIds: chainIds,
      limit: 50,
      cursor: cursor,
    };

    let res;
    try {
      res = await getNfts(request);

      latestNFTs = latestNFTs.concat(res.items);

      cursor = res.pageInfo.next;
    } catch (e) {
      console.log(e);
      break;
    }

    cursor = JSON.parse(cursor);
    if (isEmpty(cursor)) {
      break;
    }

    if (!cursor.polygon) chainIds = [1];
    if (!cursor.eth) chainIds = [137];
  }

  let finalNFTs = [];

  for (let i = 0; i < latestNFTs.length; i++) {
    let nft = latestNFTs[i];

    if (await checkIfNFTExists(nft)) continue;

    if (!nft.originalContent.uri) continue;

    if (nft.originalContent.uri.includes("ipfs://")) {
      nft.originalContent.uri = nft.originalContent.uri.replace(
        "ipfs://",
        "https://gateway.pinata.cloud/ipfs/"
      );
    } else {
      console.log(`Error with ${nft.tokenId} ${nft.contractAddress}}}`);
    }

    if (nft.originalContent.uri.startsWith("data:image/svg+xml")) {
      let png = await convertToPng(nft.originalContent.uri);

      nft.originalContent.uri = png;
    }

    let nftData = {
      tokenId: nft.tokenId,
      title: nft.name,
      description: nft.description,
      openseaLink: `https://opensea.io/assets/${nft.contractAddress}/${nft.tokenId}`,
      permaLink: nft.originalContent.uri,
      address: nft.contractAddress,
      ownerAddress: evm_address,
      chainId: nft.chainId,
      ownerId: user_id
    };

    finalNFTs.push(nftData);
  }

  return finalNFTs;
}

module.exports = updateEVMNFTs;
