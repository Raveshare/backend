const { default: axios } = require("axios");

async function mintMasterEdition(postMetadata,solanaAddress,masterEditionSettings) {

  let candyMachineSettings = JSON.stringify({
    network: process.env.NODE_ENV === "production" ? "mainnet-beta" : "devnet",
    wallet: solanaAddress,
    symbol: masterEditionSettings.symbol,
    max_supply: masterEditionSettings.itemsAvailable,
    royalty: masterEditionSettings.sellerFeeBasisPoints,
    collection: "F8Bu1WqRQ9Dr8icggo9oDtEPdXazfYCbGnQjuA55t4yi",
    items_available: masterEditionSettings.itemsAvailable,
    amount: masterEditionSettings.amount,
    creators: masterEditionSettings.creators,
  });

  const url = "https://api.shyft.to/sol/v1/candy_machine/create";

  try {
  let res = await axios.post(url, candyMachineSettings, {
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.SHYFT_API_KEY,
    },
  });
  console.log(res.data);
  return{
    status: 200,
    data: res.data.result.encoded_transaction,
  }
  } catch (err) {
    return{
      status: 500,
      data: err,
    }
  }
}

module.exports = mintMasterEdition;
