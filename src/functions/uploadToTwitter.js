const { TwitterApi } = require('twitter-api-v2');

const uploadToTwitter = async (postMetadata , ownerData) => {

    let { accessToken, accessSecret } = ownerData;

    if(!accessToken || !accessSecret) {
        res.status(401).send({
            "status": "error",
            "message": "User not authenticated"
        });
        return;
    }

    const client = new TwitterApi({
        appKey: process.env.TWITTER_CONSUMER_KEY,
        appSecret: process.env.TWITTER_CONSUMER_SECRET,
        accessToken: accessToken,
        accessSecret: accessSecret
    });

  let user = client.v1.user;

  console.log(user);

}

module.exports = uploadToTwitter;