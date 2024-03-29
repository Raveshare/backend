const axios = require("axios");

const ETHEREUM_URL = "https://api.reservoir.tools/users/";
const RESERVOIR_API_KEY = process.env.RESERVOIR_API_KEY;


const getEthNFT = async (user_id, evm_address) => {
  let nfts = [];
  console.log("Eth NFTs API Calls start", new Date().toISOString());

  let continuation = "";
  while (true) {
    let { data } = await axios.get(
      ETHEREUM_URL +
        evm_address +
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

  console.log("Eth NFTs API Calls end", new Date().toISOString());

  let formattedNFTs = [];

  for (let i = 0; i < nfts.length; i++) {
    nfts[i] = nfts[i].token;
    if (
      nfts[i].name?.includes("USDC") ||
      nfts[i].name?.includes("USDT") ||
      nfts[i].name?.toLowerCase().includes("voucher")
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

    if (!(nfts[i].metadata?.imageOriginal || nfts[i].image)) continue;

    if (
      (nfts[i].metadata?.imageOriginal || nfts[i].image)?.startsWith(
        "data:image/svg+xml"
      )
    )
      continue;

    formattedNFTs.push({
      tokenId: nfts[i].tokenId,
      title: nfts[i].name || "",
      description: nfts[i].description?.substring(0, 100) || "",
      openseaLink: `https://opensea.io/assets/ethereum/${nfts[i].collection.id}/${nfts[i].tokenId}`,
      address: nfts[i].collection.id,
      permaLink: nfts[i].metadata?.imageOriginal || nfts[i].image,
      imageLink: nfts[i].image,
      chainId: 1,
      ownerAddress: evm_address,
      creators: nfts[i].collection.royalties || [],
      ownerId: user_id,
    });
  }

  console.log(`ETH NFTs: ${formattedNFTs.length}`);

  return formattedNFTs;
};
module.exports = getEthNFT;
