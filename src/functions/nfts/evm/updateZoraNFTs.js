const { request, gql } = require("graphql-request");
const ZORA_API_URL = process.env.ZORA_API_URL;
const prisma = require("../../../prisma");
const convertToPng = require("../../image/convertToPng");
const fs = require("fs");
const uploadImageToS3 = require("../../image/uploadImageToS3");
const isEmpty = require("lodash/isEmpty");

const {
  getCache,
  setCache,
} = require("../../cache/handleCache");

async function checkIfNFTExists(nft) {
  let nftData = await getCache(
    `nft_${nft.tokenId}_${nft.collectionAddress}_${7777777}`
  );

  nftData = nftData === "true" ? true : false;

  if (!nftData) {

    const nftData = isEmpty(
      await prisma.nftData.findMany({
        where: {
          tokenId: nft.tokenId,
          address: nft.collectionAddress,
          chainId: 7777777,
        },
      })
    );
    await setCache(`nft_${nft.tokenId}_${nft.collectionAddress}_${7777777}`, nftData ? "false" : "true");

    return !nftData;
  } else {
    return nftData;
  }
}


const getZoraNFTsQuery = gql`
  query OwnedNFTs($owner: [String!], $after: String!) {
    tokens(
      networks: [{ network: ZORA, chain: ZORA_MAINNET }]
      pagination: { limit: 500, after: $after }
      where: { ownerAddresses: $owner }
    ) {
      nodes {
        token {
          collectionAddress
          tokenId
          name
          owner
          image {
            url
          }
          metadata
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

async function getZoraNFTs(owner, after = "") {
  const variables = {
    owner: [owner],
    after: after,
  };
  let resp = await request(ZORA_API_URL, getZoraNFTsQuery, variables);
  return {
    items: resp.tokens.nodes,
    pageInfo: resp.tokens.pageInfo,
  };
}

async function updateZoraNFTs(user_id, evm_address) {
  let nfts = [];
  let cursor = "";

  while (true) {
    let res;
    try {
      res = await getZoraNFTs(evm_address, cursor);
      nfts = nfts.concat(res.items);
      cursor = res.pageInfo.endCursor;
    } catch (e) {
      console.log(e);
      break;
    }

    if (!res.pageInfo.hasNextPage) {
      break;
    }
  }

  let finalNFTs = [];

  for (let i = 0; i < nfts.length; i++) {
    let nft = nfts[i].token;

    if (!nft.name) continue;

    let image = nft.image?.url || nft.metadata?.image;
    if (!image) continue;

    if (image.startsWith("ipfs://")) {
      image = image.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
    }

    let doesExist = await checkIfNFTExists(nft);
    if (doesExist) continue;

    if (image.startsWith("data:image/svg+xml")) {
      let png = await convertToPng(image);
      if (!png) continue;
      image = await uploadImageToS3(
        png,
        `users/${user_id}/nfts/zora/${nft.collectionAddress}-${nft.tokenId}.png`
      );

      finalNFTs.push({
        tokenId: nft.tokenId,
        title: nft.name,
        description: nft.metadata?.description || "",
        permaLink: image,
        openseaLink: `https://opensea.io/assets/zora/${nft.collectionAddress}/${nft.tokenId}`,
        address: nft.collectionAddress,
        chainId: 7777777,
        creators : [],
        ownerAddress: evm_address,
        ownerId: user_id,
      });
    } else {
      finalNFTs.push({
        tokenId: nft.tokenId,
        title: nft.name,
        description: nft.metadata?.description || "",
        permaLink: image,
        openseaLink: `https://opensea.io/assets/zora/${nft.collectionAddress}/${nft.tokenId}`,
        address: nft.collectionAddress,
        chainId: 7777777,
        creators : [],
        ownerAddress: evm_address,
        ownerId: user_id,
      });
    }
  }

  console.log(finalNFTs.length)

  return finalNFTs;
}

module.exports = updateZoraNFTs;