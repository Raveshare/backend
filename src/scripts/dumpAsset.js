// const assetSchema = require('../schema/assetSchema');
const prisma = require("../prisma");

const fs = require("fs").promises;
const fetch = require("node-fetch");

async function dumpAsset(name) {
  // name = "degen" + ".json";
  // let assets = fs.readFileSync("./src/dumpdata/assets/" + name);
  // assets = JSON.parse(assets);
  // // await assetSchema.bulkCreate(assets);
  // await prisma.assets.createMany({
  //   data: assets,
  //   skipDuplicates: true,
  // });

  const getAssetsByOwner = async () => {
    const response = await fetch(process.env.HELIUS_RPC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "my-id",
        method: "getAssetsByOwner",
        params: {
          ownerAddress: "Bia25RespBi2eS9KSAmpg3mozgo4RrQXFpxNjBwhgX1G",
          page: 1, // Starts at 1
          limit: 1000,
          displayOptions: {
            showFungible: true, //return both fungible and non-fungible tokens
          },
        },
      }),
    });
    const { result } = await response.json();
    const filePath = "./assetsByOwner.json";
    await fs.writeFile(filePath, JSON.stringify(result.items, null, 2));
    console.log(`Assets saved to ${filePath}`);
  };
  getAssetsByOwner();
}

// await prisma.assets.deleteMany({
//   where: {
//     createdAt: {
//       lt: new Date("2023-10-30"),
//     },
//   },
// });

module.exports = dumpAsset;
