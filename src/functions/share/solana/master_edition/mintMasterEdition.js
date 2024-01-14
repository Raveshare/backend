const { default: axios } = require("axios");

async function mintMasterEdition(postMetadata,solanaAddress,masterEditionSettings) {
  // payer = "8aAi7EV7yyLuJEGtTNmfiZdPy6C5pZctf3D1P2b9P4Xs";

  let candyMachineSettings = JSON.stringify({
    // network: "mainnet-beta",
    network: "devnet",
    wallet: "8aAi7EV7yyLuJEGtTNmfiZdPy6C5pZctf3D1P2b9P4Xs",
    symbol: masterEditionSettings.symbol,
    max_supply: masterEditionSettings.itemsAvailable,
    royalty: masterEditionSettings.sellerFeeBasisPoints,
    collection: "7KnYuwbcG3EDLBnpYTovGN1WjpB1WvvyNuMgjRezG33s",
    items_available: masterEditionSettings.itemsAvailable,
    amount: masterEditionSettings.amount,
    creators: masterEditionSettings.creators,
  });


  console.log(candyMachineSettings);

  // https://api.shyft.to/sol/v1/candy_machine/create

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
    // console.log(err);
  }

  // console.log(res.data);
  // console.log
}

module.exports = mintMasterEdition;
