const twitterRouter = require("express").Router();
const ownerSchema = require("../../schema/ownerSchema");
const store = require("store2");
const auth = require("../../middleware/auth/auth");

// const { TwitterApi } = require("twitter-api-v2");
const Twitter = require("twitter-lite");

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

  const client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  });

  let requestToken = await client.getRequestToken(
    "http://localhost:5173/api/auth/callback/twitter"
  );

  console.log(requestToken);

  res.status(200).send({
    status: "success",
    message: `https://api.twitter.com/oauth/authenticate?oauth_token=${requestToken.oauth_token}`,
  });
});

twitterRouter.get("/callback", async (req, res) => {
  let address = req.user.address;
  let { oauth_token, oauth_verifier } = req.query;

  if (!oauth_token || !oauth_verifier) {
    res.status(401).send({
      status: "error",
      message: "Invalid request parameters",
    });
  }

  const client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  });

  let accessToken = await client.getAccessToken({
    oauth_token,
    oauth_verifier,
  });

  console.log(accessToken);

  let ownerData = await ownerSchema.findOne({
    where: {
      address: address,
    },
  });

  ownerData.twitter_auth_token = {
    oauth_token: accessToken.oauth_token,
    oauth_token_secret: accessToken.oauth_token_secret,
  };
  await ownerData.save();

  res.status(200).send({
    status: "success",
    message: "Twitter Authenticated",
  });
});

module.exports = twitterRouter;
