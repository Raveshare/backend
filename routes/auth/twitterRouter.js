const twitterRouter = require('express').Router();
const ownerSchema = require('../../schema/ownerSchema');


const { TwitterApi } = require('twitter-api-v2');

twitterRouter.get('/authenticate', async (req, res) => {

    let address = req.user.address;

    let ownerData = await ownerSchema.findOne({
        where: {
            address: address
        }
    });

    if (!ownerData) {
        res.status(401).send({
            "status": "error",
            "message": "User not found"
        });
    }

    const twitterClient = new TwitterApi({
        appKey: process.env.TWITTER_CONSUMER_KEY,
        appSecret: process.env.TWITTER_CONSUMER_SECRET,
    });

    let redirectUrl = await twitterClient.generateAuthLink('http://localhost:3000/auth/twitter/callback');
    redirectUrl = redirectUrl.url;
    res.redirect(redirectUrl);
});

twitterRouter.get('/callback', async (req, res) => {

    let address = req.user.address;

    let ownerData = await ownerSchema.findOne({
        where: {
            address: address
        }
    });

    if (!ownerData) {
        res.status(401).send({
            "status": "error",
            "message": "User not found"
        });
    }

    const { oauth_token, oauth_verifier } = req.query;

    if (!oauth_token || !oauth_verifier) {
        return res.redirect('/login');
    }

    const twitterClient = new TwitterApi({
        appKey: process.env.TWITTER_CONSUMER_KEY,
        appSecret: process.env.TWITTER_CONSUMER_SECRET,
        accessToken: oauth_token,
        accessSecret: oauth_verifier
    });

    const user = await twitterClient.login(oauth_verifier);

    const { accessToken, accessSecret } = user;

    ownerData.twitter_auth_token = {
        accessToken: accessToken,
        accessSecret: accessSecret
    }
    await ownerData.save();

    res.status(200).send({
        "status": "success",
        "message": "Twitter Authenticated"
    });

});


module.exports = twitterRouter;