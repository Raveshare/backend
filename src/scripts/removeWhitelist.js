const { redis } = require("../functions/whitelist/getIsWhitelisted");
const fs = require("fs");

const removeWhitelist = async (walletsToRemove) => {
  walletsToRemove = walletsToRemove.map((wallet) => {
    return wallet.toString();
  });

  let address = await redis.get("whitelisted_wallets");
  address = await JSON.parse(address);

  let newAddress = [];
  for (let i = 0; i < address.length; i++) {
    if (!walletsToRemove.includes(address[i])) {
      newAddress.push(address[i]);
    }
  }

  //   fs.writeFileSync("whitelisted_wallets.json", JSON.stringify(newAddress));
  await redis.set("whitelisted_wallets", JSON.stringify(newAddress));
  return true;
};
