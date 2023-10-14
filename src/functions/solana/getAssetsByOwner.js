const HELIUS_RPC_URL = process.env.HELIUS_RPC_URL;

const fs = require('fs');

const getAssetsByOwner = async (ownerAddress , page = 1) => {
  const response = await fetch(HELIUS_RPC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'my-id',
      method: 'getAssetsByOwner',
      params: {
        ownerAddress: ownerAddress,
        page: page, // Starts at 1
        limit: 1000
      },
    }),
  });

  // This can be cached unless the owner NFTs changes from previous. 
  const { result } = await response.json();
  let items = result.items;

  let nfts = [];

  for(let i=0 ; i<items.length ; i++) {
    let item = items[i];
    console.log(item);

    let nft = {
      tokenId : item.id,
      title : item.content.metadata.name,
      description : item.content.metadata.description,
      openseaLink : `https://www.tensor.trade/item/${item.id}`,
      permaLink : item.content.files.uri || item.content.links.image,
      address : item.grouping[0]?.group_value,
      creators : item.creators,
    }

    nfts.push(nft);
  }

  fs.writeFileSync('nfts.json', JSON.stringify(nfts));
};

module.exports = getAssetsByOwner;

// id = J71224RNf7QqM5apxtqbxUxM4JGyFiJnpMjwaCfEnNqS

// content = files -> cdn_uri OR uri

// grouping = group_key = group_value

// creators = address + share

// metadata = name
// metadata = description

