const getBaseNFT = require("../reservoir/getBaseNFT");
const getEthNFT = require("../reservoir/getEthNFT");
const getPolygonNFT = require("../reservoir/getPolygonNFT");
const { isEmpty } = require("lodash");

const prisma = require("../../../prisma");

const { getCache, setCache } = require("../../cache/handleCache");

/**
 * 
 * @param {*} nft 
 * @returns Returns 
 */
async function checkIfNFTExists(nft) {
  // returns true if nft exists
  let nftData = await getCache(
    `nft_${nft.tokenId}_${nft.address}_${nft.chainId}`
  );

  nftData = ((nftData === "true") ? true : false);

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
    // sets cache to true if nft exists
    await setCache(`nft_${nft.tokenId}_${nft.address}_${nft.chainId}`, nftData ? "false" : "true");

    // returns true if nft exists
    return !nftData;
  } else {
    return nftData;
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

    let doesExist = await checkIfNFTExists(nft);
    if (doesExist) continue;
  
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
