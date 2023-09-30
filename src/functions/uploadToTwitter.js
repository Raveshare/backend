const axios = require("axios");
// const oauthSignature = require("oauth-signature");
// const oauth = require("oauth");

const uploadToTwitter = async (postMetadata, ownerData) => {
  console.log;

  let { access_token  } = ownerData.twitter_auth_token;

  if (!access_token) {
    res.status(401).send({
      status: "error",
      message: "User not authenticated",
    });
    return;
  }

  let consumer_key = process.env.TWITTER_CONSUMER_KEY;
  let consumer_secret = process.env.TWITTER_CONSUMER_SECRET;

  let postURL = "https://api.twitter.com/2/";

  let body = {
    text: "gm from @lenspostxyz",
  };

  let oauth = new OAuth.OAuth(
    "https://api.twitter.com/oauth/request_token",
    "https://api.twitter.com/oauth/access_token",
    consumer_key,
    consumer_secret,
    "1.0A",
    null,
    "HMAC-SHA1"
  );

  let oauth_timestamp = Math.round(Date.now() / 1000).toString();
  let oauth_nonce = Math.random().toString(36).substring(2, 15);

  // compute oauth singature for twitter
  let oauth_signature = oauthSignature.generate(
    "POST",
    postURL,
    {
      text: "gm from @lenspostxyz",
    },

    {
      oauth_consumer_key: consumer_key,
      oauth_token: access_token_key,
      oauth_nonce: oauth_nonce,
      oauth_timestamp: oauth_timestamp,
      oauth_signature_method: "HMAC-SHA1",
      oauth_version: "1.0",
    }
  );

  console.log("oauth_signature", oauth_signature);

  let client = axios.create({
    baseURL: postURL,
    headers: {
      "Content-Type": "application/json",
      Authorization: `OAuth oauth_consumer_key="${consumer_key}", oauth_token="${access_token_key}", oauth_signature_method="HMAC-SHA1", oauth_timestamp="${oauth_timestamp}", oauth_nonce="${oauth_nonce}", oauth_version="1.0", oauth_signature="${oauth_signature}"`,
    },
  });

  await client.post("tweets", {
    text: "gm from @lenspostxyz",
  });

  console.log();

  try {
    await client.post("tweets", {
      text: "gm from @lenspostxyz",
    });
  } catch (e) {
    console.log(e);
  }

  return;
};

module.exports = uploadToTwitter;
