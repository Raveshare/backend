// const fs = require("fs");
// const assetSchema = require("../schema/assetSchema");
// const nftSchema = require("../schema/nftSchema");
// const canvasSchema = require("../schema/canvasSchema");
// const templateSchema = require("../schema/templateSchema");

// const content = require("../schema/content");
// const collections = require("../schema/collections");

// async function deleteAsset() {
//   assetSchema.destroy({
//     where: {
//       author: "nouns",
//     },
//   });
// }

// async function deleteNFT() {
//   nftSchema.destroy({
//     where: {
//       permaLink: "https://shibnft.cc/nft2.png"
//     }
//   });
// }

// async function deleteCanvas() {
//   canvasSchema.destroy({
//     where: {
//       imageLink: null,
//     },
//     truncate: true,
//   });
// }

// async function deleteTemplate() {
//   templateSchema.destroy({
//     where: {},
//     truncate: true,
//   });
// }

// async function deleteCollection(id) {
//   await content.destroy({
//     where: {

//     }
//   });

//   await collections.destroy({
//     where: {
//       // id : id
//     },
//   });
// }

// module.exports = {
//   deleteAsset,
//   deleteNFT,
//   deleteCanvas,
//   deleteTemplate,
//   deleteCollection
// };
