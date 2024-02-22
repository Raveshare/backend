const getBaseNFT = require("../reservoir/getBaseNFT");
const getEthNFT = require("../reservoir/getEthNFT");
const getPolygonNFT = require("../reservoir/getPolygonNFT");
const getOptimismNFT = require("../reservoir/getOptimismNFT");
const getZoraNFT = require("../reservoir/getZoraNFT");

const prisma = require("../../../prisma");

const { getCache, setCache } = require("../../cache/handleCache");

/**
 *
 * @param {*} nft
 * @returns Returns
 */
async function checkIfNFTExists(nft) {
  // returns true if nft exists
  let cacheResult = await getCache(
    `nft_${nft.tokenId}_${nft.address}_${nft.chainId}`
  );
  cacheResult = cacheResult === "true"

  if (!cacheResult) {
    const dbResult = await prisma.nftData.findMany({
      where: {
        tokenId: nft.tokenId,
        address: nft.address,
        chainId: nft.chainId,
      },
    });
    // sets cache to true if nft exists
    const nftExists = dbResult.length > 0;
    await setCache(
      `nft_${nft.tokenId}_${nft.address}_${nft.chainId}`,
      nftExists ? "true" : "false"
    );

    // returns true if nft exists
    return nftExists;
  } else {
    return cacheResult;
  }
}

async function updateEVMNFTs(user_id, evm_address) {
  let ethNFTs = getEthNFT(user_id, evm_address);
  let polNFTs = getPolygonNFT(user_id, evm_address);
  let baseNFTs = getBaseNFT(user_id, evm_address);
  let optimismNFT = getOptimismNFT(user_id, evm_address);
  let zoraNFTs = getZoraNFT(user_id, evm_address);

  let nfts = await Promise.all([
    ethNFTs,
    polNFTs,
    baseNFTs,
    optimismNFT,
    zoraNFTs,
  ]);

  let latestNFTs = nfts[0].concat(nfts[1], nfts[2], nfts[3], nfts[4]);
  let finalNFTs = [];

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

  for (let i = 0; i < latestNFTs.length; i++) {
    let nft = latestNFTs[i];

    let doesExist = existResults[i];

    if (doesExist) continue;

    if (nft.permaLink.includes("ipfs://")) {
      nft.permaLink = nft.permaLink.replace(
        "ipfs://",
        "https://gateway.pinata.cloud/ipfs/"
      );
    } else {
      console.log(`Error with ${nft.tokenId} ${nft.address}`);
    }

    console.log()

    finalNFTs.push(nft);
  }

  console.log("Eth NFTs API Calls end", new Date().toISOString());
  return finalNFTs;
}

module.exports = updateEVMNFTs;
