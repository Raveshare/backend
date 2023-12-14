const farcasterRouter = require("express").Router();
const { NeynarAPIClient } = require("@neynar/nodejs-sdk");
const jsonwebtoken = require("jsonwebtoken");

// Initializing Neynar Client via Neynar API Key
const client = new NeynarAPIClient(process.env.NEYNAR_API_KEY);

farcasterRouter.post("/", async (req, res) => {
  try {
    let evm_address = req.user.evm_address;
    const user = (await client.lookupUserByVerification(evm_address)).result
      .user;

    res.status(200).send({
      message: user,
    });
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
  }
});

module.exports = farcasterRouter;
