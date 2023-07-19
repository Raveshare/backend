const twitterRouter = require("express").Router();
const ownerSchema = require("../../schema/ownerSchema");
const store = require("store2");
const crypto = require("crypto");
const axios = require("axios");
const qs = require("qs");

twitterRouter.get("/authenticate", async (req, res) => {
  let address = req.user.address;

  let ownerData = await ownerSchema.findOne({
    where: {
      address: address,
    },
  });

  if (!ownerData) {
    res.status(401).send({
      status: "error",
      message: "User not found",
    });
  }

  let TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID;
  let REDIRECT_URI = process.env.TWITTER_CALLBACK_URL;

  let state = crypto.randomBytes(32).toString("base64");
  let code_challenge = crypto.randomBytes(32).toString("base64");

  state = state.replace(/\//g, "_").replace(/\+/g, "-").replace(/=/g, "");

  store.set(`state_${state}`, {
    address: address,
    code_challenge: code_challenge,
  });

  console.log("state", state);

  let url = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${TWITTER_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=tweet.write%20offline.access&state=${state}&code_challenge=${code_challenge}&code_challenge_method=plain`;

  res.status(200).send({
    status: "success",
    message: url,
  });
});

twitterRouter.get("/callback", async (req, res) => {
  let address = req.user.address;
  let { state, code } = req.query;

  if (!state || !code) {
    res.status(401).send({
      status: "error",
      message: "Invalid request parameters",
    });
  }

  // cFZvR0NIVUo0bDlwWmM5WnpQd3ROQjlhX1d4TlBJWWU0QU5mQVoxR1JneHkyOjE2ODk4MDI3OTA0OTI6MTowOmFjOjE

  // q5oUSJUCjeYlKexr45%2FBVqvfpUMJUlrkHZlBnotg1KM%3D

  let stateData = store.get(`state_${state}`);

  // let stateData = {
  //   address: "0x0CF97e9C28C5b45C9Dc20Dd8c9d683E0265190CB",
  //   code_challenge: "iqVTa0ZME4WOudsnZayNk9VT9NAxmokd5FtEg3Kxhuc=",
  // };

  console.log("stateData", stateData);

  if (!stateData) {
    res.status(403).send({
      status: "error",
      message: "forbidden",
    });

    return;
  }

  let { address: stateAddress, code_challenge } = stateData;

  console.log("stateAddress", stateAddress);

  if (address !== stateAddress) {
    res.status(403).send({
      status: "error",
      message: "forbidden",
    });
    return;
  }

  let TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID;

  let TWITTER_CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY;
  let TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET;

  let REDIRECT_URI = process.env.TWITTER_CALLBACK_URL;

  let url = `https://api.twitter.com/oauth2/token`;

  let response;

  try {
    let data = {
      grant_type: "client_credentials",
      redirect_uri: REDIRECT_URI,
      code: code,
      code_verifier: code_challenge,
      client_id: TWITTER_CLIENT_ID,
    };

    let config = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${TWITTER_CONSUMER_KEY}:${TWITTER_CONSUMER_SECRET}`
        ).toString("base64")}`,
      },
    };

    response = await axios.post(url, qs.stringify(data), config);
  } catch (e) {
    console.log("e", e.response.data);
    res.status(401).send({
      status: "error",
      message: "Invalid request parameters",
    });
    return;
  }

  let ownerData = await ownerSchema.findOne({
    where: {
      address: address,
    },
  });

  try {
    ownerData.twitter_auth_token = {
      access_token: response.data.access_token,
    };
    await ownerData.save();
  } catch (e) {
    console.log("e", e);
  }

  res.status(200).send({
    status: "success",
    message: "Twitter Authenticated",
  });
});

module.exports = twitterRouter;
