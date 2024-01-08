const fs = require("fs");
// const assetSchema = require('../schema/assetSchema');
const prisma = require("../prisma");

async function dumpAsset(name) {
  //   name = "" + ".json";
  //   let assets = fs.readFileSync("./src/dumpdata/assets/" + name);
  //   assets = JSON.parse(assets);
  //   // await assetSchema.bulkCreate(assets);
  //   await prisma.assets.createMany({
  //     data: assets,
  //     skipDuplicates: true,
  //   });
  await prisma.assets.updateMany({
    where: {
      author: "GI Toadz",
    },
    data: {
      campaign: "GI Toadz",
    },
  });
}

// await prisma.assets.deleteMany({
//   where: {
//     createdAt: {
//       lt: new Date("2023-10-30"),
//     },
//   },
// });

module.exports = dumpAsset;
