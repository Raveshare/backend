const farcasterRouter = require("express").Router();
const axios = require("axios");
const prisma = require("../../prisma");

// checks if user has registered farcaster
farcasterRouter.get("/check", async (req, res) => {
  const user_id = req.user.user_id;

  let signer_uuid;

  try {
    let ownerData = await prisma.owners.findUnique({
      where: {
        id: user_id,
      },
      select: {
        farcaster_signer_uuid: true,
      },
    });

    if (!ownerData)
      return res.status(404).send({
        message: "Unauthorized",
      });

    signer_uuid = ownerData.farcaster_signer_uuid;

    if (!signer_uuid) {
      return res.status(404).send({
        message: false,
      });
    }

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

    if (response.data?.status === "approved") {
      res.status(200).json({ message: true });
    } else {
      res.status(404).json({ message: false });
    }
  } catch (error) {
    return res.status(500).send({
      message: "Internal Server Error",
      error,
    });
  }
});

farcasterRouter.post("/register", async (req, res) => {
  let user_id = req.user.user_id;
  let farcaster_signer_uuid, farcaster_id;
  try {
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
      message: "Successfully registered",
    });
  } catch (error) {
    res.status(500).send({
      message: error
    });
  }
});

module.exports = farcasterRouter;
