const router = require("express").Router();
const prisma = require("../../prisma");
const mintToERC721 = require("../../functions/mint/mintToERC721");
const mintToERC721Sponsored = require("../../functions/mint/mintToERC721Sponsored");
const getOrCreateWallet = require("../../functions/mint/getOrCreateWallet");
const auth = require("../../middleware/auth/auth");
const { ethers } = require("ethers");

router.post("/", async (req, res) => {
  const fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;
  console.log("origin_url", fullUrl);
  console.log(req.get("host"));

  host = req.get("host");

  let NODE_ENV = process.env.NODE_ENV;

  if (NODE_ENV === "production") {
    if (host !== "frame.lenspost.xyz") {
      return res.status(400).json({ message: "Invalid host" });
    }
  }

  let { frameId, recipientAddress } = req.body;

  let frame = await prisma.frames.findUnique({
    where: {
      id: frameId,
    },
    select: {
      sponsoredMint: true,
      contract_address: true,
      owner: true,
    },
  });

  let sponsoredMint = frame.sponsoredMint || 0;

  if (sponsoredMint <= 0) {
    let tx = await mintToERC721(
      frame.contract_address,
      recipientAddress,
      frame.owner
    );
    res.send({
      message: "Minted successfully",
      tx: tx,
    });
  } else {
    let tx = await mintToERC721Sponsored(
      frame.contract_address,
      recipientAddress
    );
    res.send({
      message: "Minted successfully",
      tx: tx,
    });
  }
});

router.get("/",auth, async (req, res) => {

  let userWallet = await getOrCreateWallet(req.user.user_id);
  res.send(userWallet);

});

module.exports = router;
