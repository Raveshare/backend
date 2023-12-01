const getBaseNFT = require("../reservoir/getBaseNFT");
const getEthNFT = require("../reservoir/getEthNFT");
const getPolygonNFT = require("../reservoir/getPolygonNFT");
const { isEmpty } = require("lodash");

const prisma = require("../../prisma");

const { getCache, setCache } = require("../../functions/cache/handleCache");

/**
 * 
 * @param {*} nft 
 * @returns Returns 
 */
async function checkIfNFTExists(nft) {
  let nftData = await getCache(
    `nft_${nft.tokenId}_${nft.address}_${nft.chainId}`
  );

  nftData = nftData === "true" ? true : false;

  if (!nftData) {
    const nftData = isEmpty(
      await prisma.nftData.findMany({
        where: {
          tokenId: nft.tokenId,
          address: nft.address,
          chainId: nft.chainId,
        },
      })
    );
    await setCache(`nft_${nft.tokenId}_${nft.address}_${nft.chainId}`, nftData ? "false" : "true");

    return !nftData;
  } else {
    return nftData === "true" ? true : false;
  }
}

async function updateEVMNFTs(user_id, evm_address) {
  let ethNFTs = await getEthNFT(user_id, evm_address);
  let polNFTs = await getPolygonNFT(user_id, evm_address);
  let baseNFTs = await getBaseNFT(user_id, evm_address);

  let latestNFTs = ethNFTs.concat(polNFTs).concat(baseNFTs)
  let finalNFTs = [];
  for (let i = 0; i < latestNFTs.length; i++) {
    let nft = latestNFTs[i];

    if (await checkIfNFTExists(nft)) continue;
  
    if (nft.permaLink.includes("ipfs://")) {
      nft.permaLink = nft.permaLink.replace(
        "ipfs://",
        "https://gateway.pinata.cloud/ipfs/"
      );
    } else {
      console.log(`Error with ${nft.tokenId} ${nft.address}`);
    }


    finalNFTs.push(nft);
  }
  return finalNFTs;
}

module.exports = updateEVMNFTs;
