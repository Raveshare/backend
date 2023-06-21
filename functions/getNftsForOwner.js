// Imports the Alchemy SDK
const { Alchemy, Network } = require("alchemy-sdk");
const uploadImageFromLinkToS3 = require("./uploadImageFromLinkToS3");

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
    let imageLink;

    try {
      imageLink = nft["media"][0]["gateway"]
    } catch (error) {
      imageLink = nft["rawMetadata"]["media"][0]["item"];
    }

    if(imageLink == undefined) continue;
    if(imageLink.includes("ipfs")) continue;

    let format = imageLink.split(".").pop();
    let filename = imageLink.split("/").pop().split(".").shift();

    let s3Link = await uploadImageFromLinkToS3(imageLink, ownerAddress, filename , format);

    try {
      nftMetadata.push({
        address: nft["contract"]["address"],
        title: nft["title"],
        description: nft["description"],
        permaLink: imageLink,
        imageURL: s3Link,
        tokenId: nft["tokenId"],
        openseaLink: `https://opensea.io/assets/${nft["contract"]["address"]}/${nft["tokenId"]}`,
        isPublic: false
      });
    } catch (error) {
      console.log(error);
      console.log(nft);
    }
  }
  return {
    ownerAddress,
    nftMetadata,
  };
};

module.exports = getNftsForOwner;