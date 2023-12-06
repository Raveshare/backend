const { redis } = require("./getIsWhitelisted");

const addToWhitelist = async (wallet) => {
  let address = await redis.get("whitelisted_wallets");
  address = await JSON.parse(address);
  if (!address.includes(wallet)) address.push(wallet);

  await redis.set("whitelisted_wallets", JSON.stringify(address));
  return true;
};

module.exports = addToWhitelist;
