const { ConsoleSpanExporter } = require("@opentelemetry/sdk-trace-base");
const prisma = require("../../prisma");
const { isEmpty } = require("lodash");

async function checkIfNFTExists(nft) {
  return !isEmpty(await prisma.nftData.findMany({
    where: {
      tokenId: nft.tokenId,
      address: nft.contractAddress,
    },
  }));
}

const HELIUS_RPC_URL = process.env.HELIUS_RPC_URL;

const updateSolanaNFTs = async (user_id,solana_address, page = 1) => {
  const response = await fetch(HELIUS_RPC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "my-id",
      method: "getAssetsByOwner",
      params: {
        ownerAddress: solana_address,
        page: page, // Starts at 1
        limit: 1000,
      },
    }),
  });
  const { result } = await response.json();
  let items = result.items;

  console.log("solana", items.length);

  let latestNFTs = [];

  for (let i = 0; i < items.length; i++) {
    let item = items[i];
    
    if (await checkIfNFTExists({
      tokenId: item.id,
      address: item.grouping[0]?.group_value,
    })) continue;

    if(!item.content.files.uri && !item.content.links.image) continue;

    let nft = {
      tokenId: item.id,
      title: item.content.metadata.name,
      description: item.content.metadata.description || "",
      openseaLink: `https://www.tensor.trade/item/${item.id}`,
      permaLink: item.content.files.uri || item.content.links.image,
      address: item.grouping[0]?.group_value || "",
      creators: item.creators || [],
      ownerAddress: solana_address,
      chainId: 2,
      ownerId: user_id
    };

    // items[i] = nft;
    latestNFTs.push(nft);
  }

  return latestNFTs;
};

module.exports = updateSolanaNFTs;
