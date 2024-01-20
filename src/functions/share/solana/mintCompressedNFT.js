const url = process.env.HELIUS_RPC_URL;

const mintCompressedNft = async (metadata, address, params) => {

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "helius-test",
      method: "mintCompressedNft",
      params: {
        name: metadata.name,
        symbol: metadata.symbol || "GM",
        owner: address,
        // collection: "F8Bu1WqRQ9Dr8icggo9oDtEPdXazfYCbGnQjuA55t4yi",
        description: metadata.content
          ? metadata.content + " Made using @lenspost.xyz"
          : "This is created using @lenspostxyz",
        attributes: [],
        creators: params.creators || [
          {
            address: address,
            share: 100,
          },
        ],
        imageUrl: `https://gateway.pinata.cloud/ipfs/${metadata.image[0]}`,
        externalUrl: "https://www.lenspost.xyz",
        sellerFeeBasisPoints: metadata.sellerFeeBasisPoints || 500,
      },
    }),
  });


  const { result, error } = await response.json();

  return result?.assetId
    ? {
        status: 200,
        assetId: `http://xray.helius.xyz/token/${result.assetId}`,
      }
    : {
        status: 500,
        error: error,
      };
};

module.exports = mintCompressedNft;
