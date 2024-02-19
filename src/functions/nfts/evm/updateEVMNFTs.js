const getBaseNFT = require("../reservoir/getBaseNFT");
const getEthNFT = require("../reservoir/getEthNFT");
const getPolygonNFT = require("../reservoir/getPolygonNFT");
const getOptimismNFT = require("../reservoir/getOptimismNFT");
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

  // let nftData = "false";
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
    // sets cache to true if nft exists
    await setCache(
      `nft_${nft.tokenId}_${nft.address}_${nft.chainId}`,
      nftData ? "false" : "true"
    );

    // returns true if nft exists
    return !nftData;
  } else {
    return nftData;
  }
}

async function updateEVMNFTs(user_id, evm_address) {
  // let ethNFTs = await getEthNFT(user_id, evm_address);
  // let polNFTs = await getPolygonNFT(user_id, evm_address);
  // let baseNFTs = await getBaseNFT(user_id, evm_address);
  let optimismNFT = await getOptimismNFT(user_id, evm_address);
  console.log("Eth, Poly, Base & Optimism NFTs are fetched");

  // let latestNFTs = ethNFTs.concat(polNFTs).concat(baseNFTs).concat(optimismNFT);
  let latestNFTs = optimismNFT;
  let finalNFTs = [];

  console.log("Exist checks start", new Date().toISOString());

  const processBatch = async (batch) => {
    const existChecks = batch.map((nft) => checkIfNFTExists(nft));
    return await Promise.all(existChecks);
  };
  const existResults = [];
  for (let i = 0; i < latestNFTs.length; i += 10) {
    const batch = latestNFTs.slice(i, i + 10);
    const batchResults = await processBatch(batch);
    existResults.push(...batchResults);
  }
  console.log("Exist checks are done", new Date().toISOString());

  for (let i = 0; i < latestNFTs.length; i++) {
    let nft = latestNFTs[i];

    let doesExist = existResults[i];

    if (doesExist) continue;

    console.log(
      `NFT ${nft.tokenId} ${nft.address} ${nft.chainId} doesn't exist. Adding to finalNFTs array`
    );
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
