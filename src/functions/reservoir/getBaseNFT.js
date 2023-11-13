const axios = require("axios");

const BASE_URL = "https://api-base.reservoir.tools/users/";
const RESERVOIR_API_KEY = process.env.RESERVOIR_API_KEY;

const getBaseNFT = async (user_id, address) => {
  let nfts = [];

  let continuation = "";
  while (true) {
    let { data } = await axios.get(
      BASE_URL +
        address +
        "/tokens/v7?limit=200" +
        (continuation ? "&continuation=" + continuation : ""),
      {
        headers: {
          "x-api-key": RESERVOIR_API_KEY,
        },
      }
    );

    continuation = data.continuation;
    data = data.tokens;

    data = data.map((item) => {
      const { ownership, ...rest } = item; // Use object destructuring to remove 'ownership' property
      return rest;
    });

    nfts.push(...data);

    if (!continuation) break;
  }

  console.log(nfts.length);

  let formattedNFTs = [];

  for (let i = 0; i < nfts.length; i++) {
    nfts[i] = nfts[i].token;
    if (!nfts[i].image) continue;
    if (
      nfts[i].name.includes("USDC") ||
      nfts[i].name.includes("USDT") ||
      nfts[i].name.toLowerCase().includes("voucher")
    )
      continue;
    if (
      (nfts[i].description || "").toLowerCase().includes("nft voucher") ||
      (nfts[i].description || "").toLowerCase().includes("voucher") ||
      (nfts[i].description || "").toLowerCase().includes("usdc") ||
      (nfts[i].description || "").toLowerCase().includes("usdt") ||
      (nfts[i].description || "").toLowerCase().includes("dai") ||
      (nfts[i].description || "").toLowerCase().includes("owning this badge")
    )
      continue;

    formattedNFTs.push({
      tokenId: nfts[i].tokenId,
      title: nfts[i].name,
      description: nfts[i].description,
      openseaLink: `https://opensea.io/assets/base/${nfts[i].collection.id}/${nfts[i].tokenId}`,
      address: nfts[i].collection.id,
      permaLink: nfts[i].metadata?.imageOriginal || nfts[i].image,
      imageLink: nfts[i].image,
      chainId: 8453,
      ownerId: user_id,
    });
  }

  console.log(formattedNFTs);

  return formattedNFTs;
};

module.exports = getBaseNFT;
