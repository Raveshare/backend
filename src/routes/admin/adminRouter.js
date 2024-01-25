const adminRouter = require("express").Router();

const deleteDuplicates = require("../../scripts/deleteDuplicates");
const dumpCanvas = require("../../scripts/dumpCanvas");
const dumpAsset = require("../../scripts/dumpAsset");
const {deleteNFT} = require("../../scripts/deleteAsset");
const cleanCanvas = require("../../scripts/cleanCanvas");
const sendInvite = require("../../scripts/sendInvite");
const {updateCanvas} = require("../../scripts/deleteAsset");

adminRouter.get("/deleteDuplicates", async (req, res) => {
  await deleteDuplicates();
  res.send("Duplicates deleted");
});

adminRouter.get("/dumpCanvas", async (req, res) => {
  // await dumpCanvas();
  console;
  res.send("Canvas dumped");
});

adminRouter

adminRouter.get("/cleanCanvas", async (req, res) => {
  await cleanCanvas();
  res.send("Canvas cleaned");
});

adminRouter.post("/dumpAsset", async (req, res) => {
  // console.log("hey");
  await dumpAsset(); 
  res.send("Canvas dumped");
});

adminRouter.delete("/deleteNFT", async (req, res) => {
  await updateCanvas();
  res.send("NFT deleted");
});

adminRouter.get("/sendInvite", async (req, res) => {
  // console.log("hey");
  const data = await sendInvite(req, res);
  // res.send(data);
});

module.exports = adminRouter;
