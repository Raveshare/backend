const adminRouter = require("express").Router();
const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const dumpContent = require("../../scripts/dumpContent");
const dumpTemplate = require("../../scripts/dumpTemplate");

const dumpAsset = require("../../scripts/dumpAsset");
const {
  deleteNFT,
  deleteCanvas,
  deleteTemplate,
  deleteAsset,
  deleteCollection,
} = require("../../scripts");

adminRouter.get("/", async (req, res) => {
  res.send("Admin Router");
});

adminRouter.get("/dumpContent", async (req, res) => {
  // let { address , name, openseaLink, image , filename } = req.query;

  let data = ["lilnouns"];

  // let collectionDetails = {
  //     address: address,
  //     name: name,
  //     openseaLink: openseaLink,
  //     image : image
  // };

  // let filename = `

  try {
    for (let i = 0; i < data.length; i++) {
      let filename = data[i] + ".json";

      let result = await dumpContent(filename);

      console.log(result);
    }
  } catch (err) {
    console.log(err);
  }

  res.send(result);
});

adminRouter.get("/dumpTemplate", async (req, res) => {
  let { name } = req.query;

  let result = await dumpTemplate(name);

  res.send(result);
});

adminRouter.get("/dumpAsset", async (req, res) => {
  let { name } = req.query;

  let result = await dumpAsset(name);

  res.send(result);
});

adminRouter.delete("/deleteAsset", async (req, res) => {
  // // let result = await deleteNFT();
  // let result = await deleteTemplate();
  let result2 = await deleteCanvas();
  let result = await deleteAsset();
  res.send(result);
});

adminRouter.delete("/deleteNFT", async (req, res) => {
  let id = req.query.ownerAddress;

  console.log(id);

  let result = await deleteNFT(id);

  res.send(result);
});

adminRouter.delete("/deleteCollection", async (req, res) => {
  let id = req.query.id;

  let result = await deleteCollection(id);

  res.send(result);
});

module.exports = adminRouter;
