// Imports the Alchemy SDK
const { Alchemy, Network } = require("alchemy-sdk");

// Configures the Alchemy SDK
const eth_config = {
  apiKey: process.env.ALCHEMY_API_KEY, // Replace with your API key
  network: Network.ETH_MAINNET, // Replace with your network
};

const poly_config = {
  apiKey: process.env.ALCHEMY_API_KEY, // Replace with your API key
  network: Network.MATIC_MAINNET, // Replace with your network
};

// Creates an Alchemy object instance with the config to use for making requests
const eth_alchemy = new Alchemy(eth_config);
const poly_alchemy = new Alchemy(poly_config);

/**
 * Returns the NFTs owned by the ownerAddress
 * @param {*} ownerAddress A valid ethereum address 
 * @returns 
 */

const getNftsForOwner = async (ownerAddress) => {
  let eth_response = await eth_alchemy.nft.getNftsForOwner(
    (owner = ownerAddress),
    (excludeFilters = "SPAM")
  );

  let poly_response = await poly_alchemy.nft.getNftsForOwner(
    (owner = ownerAddress),
    (excludeFilters = "SPAM")
  );

  //Logging the response to the console
  ownedNFT = eth_response["ownedNfts"].concat(poly_response["ownedNfts"]);
  let nftMetadata = [];
  for (let i = 0; i < ownedNFT.length; i++) {
    nft = ownedNFT[i];
    if (
      nft["title"] == undefined ||
      nft["description"] == undefined ||
      nft["rawMetadata"]["image"] == undefined
    )
      continue;
    nftMetadata.push({
      address : nft["contract"]["address"],
      title: nft["title"],
      description: nft["description"],
      permaLink: nft["rawMetadata"]["image"],
      imageURL : nft["rawMetadata"]["image"],
      tokenId: nft["tokenId"],
      openseaLink: `https://opensea.io/assets/${nft["contract"]["address"]}/${nft["tokenId"]}`,
      isPublic : false
    });
  }
  return {
    ownerAddress,
    nftMetadata,
  };
};

// getNftsForOwner("0x726fbc2349c4033366242a7db2721066999eb1e1").then((result) => {
//   console.log(result);
// });

module.exports = getNftsForOwner;