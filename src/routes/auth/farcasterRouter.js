const farcasterRouter = require("express").Router();
const { NeynarAPIClient } = require("@neynar/nodejs-sdk");
const jsonwebtoken = require("jsonwebtoken");

// Initializing Neynar Client via Neynar API Key
const client = new NeynarAPIClient(process.env.NEYNAR_API_KEY);

farcasterRouter.post("/", async (req, res) => {
  try {
    token = req.headers.authorization.split(" ")[1];
    decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    const user = (await client.lookupUserByVerification(req.user.evm_address))
      .result.user;
    // console.log(user.result.user)
    // user = user.result.user;

    res.status(200).send({
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      status: "failed",
      message: error.message,
    });
  }
});

module.exports = farcasterRouter;
