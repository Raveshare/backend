const farcasterRouter = require("express").Router();
const axios = require("axios");
const prisma = require("../../prisma");

farcasterRouter.post("/", async (req, res) => {
  // let evm_address = req.user.evm_address;
  let user_id = req.user.user_id;
  let signature;

  try {
    signature = req.body.signature;
    id = req.body.id;
  } catch (error) {
    res.status(400).send({
      status: "failed",
      message: "Invalid Request Parameters",
    });
    return;
  }
  let ownerData = await prisma.owners.findUnique({
    where: {
      id: user_id,
    },
  });

  if (ownerData.farcaster_id) {
    res.status(200).send({
      message: farcaster_id,
    });
    return;
  } else return res.status(404).send({ message: "Farcaster not found" });
});

farcasterRouter.get("/check", async (req, res) => {
  const user_id = req.body.user_id;
  // console.log(req.body.user_id);
  let signer_uuid;

  try {
    let ownerData = await prisma.owners.findUnique({
      where: {
        id: user_id,
      },
    });
    // console.log(ownerData);
    signer_uuid = ownerData.farcaster_signer_uuid;
    if (!signer_uuid) {
      res.status(404).send({
        status: "failed",
        message: "No signer found with this user_id, please register one",
      });
      return;
    }
  } catch (error) {
    res.status(500).send({
      status: "failed",
      message: "No owner found with this user_id",
    });
    return;
  }
  try {
    const response = await axios({
      method: "get",
      url: "https://api.neynar.com/v2/farcaster/signer",
      headers: {
        accept: "application/json",
        api_key: process.env.NEYNAR_API_KEY,
      },
      params: {
        signer_uuid,
      },
    });
    if (response.data.status === "approved") {
      res.status(200).json({ message: "success" });
    } else {
      res
        .status(404)
        .json({ message: "Signer not found. Please register one" });
    }
  } catch (error) {
    if (error.response.status === 404)
      res
        .status(404)
        .json({ message: "Signer not found. Please register one" });
    else res.status(500).json({ error: "Internal Server Error" });
  }
});

farcasterRouter.post("/register", async (req, res) => {
  let user_id, farcaster_signer_uuid, farcaster_id;
  try {
    user_id = req.body.user_id;
    farcaster_signer_uuid = req.body.signer_uuid;
    farcaster_id = req.body.fid;
  } catch (error) {
    res.status(400).send({
      status: "failed",
      message: "Invalid Request Parameters",
    });
    return;
  }
  try {
    await prisma.owners.update({
      where: {
        id: user_id,
      },
      data: {
        farcaster_signer_uuid,
        farcaster_id,
      },
    });

    res.status(200).send({
      status: "success",
      message: "Successfully registered",
    });
  } catch (error) {
    res.status(500).send({
      status: "failed",
      message: "Internal Server Error",
    });
  }
});

module.exports = farcasterRouter;
