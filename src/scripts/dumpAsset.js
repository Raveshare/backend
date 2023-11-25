const fs = require("fs");
// const assetSchema = require('../schema/assetSchema');
const prisma = require("../prisma");

async function dumpAsset(name) {
    let assets = fs.readFileSync('./src/dumpdata/assets/' + name);
    assets = JSON.parse(assets);
    // await assetSchema.bulkCreate(assets);
    await prisma.assets.createMany({
        data: assets,
        skipDuplicates: true
    });

}

// async function dumpAsset(author,campaign) {

//     await prisma.assets.updateMany({
//         where: {
//             // "createdAt" : {
//             //     "gte" : new
//             // }
//             "author" : author,
//         },
//         data : {
//             "campaign" : "Halloween"
//         }
//     })
// }

// async function dumpAsset() {
//   await prisma.assets.deleteMany({
//     where: {
//       createdAt: {
//         lt: new Date("2023-10-30"),
//       },
//     },
//   });
// }

module.exports = dumpAsset;
