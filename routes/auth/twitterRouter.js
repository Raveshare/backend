const twitterRouter = require('express').Router();
const ownerSchema = require('../../schema/ownerSchema');
const store = require('store2')
const auth = require('../../middleware/auth/auth');



const { TwitterApi } = require('twitter-api-v2');

twitterRouter.get('/authenticate',auth, async (req, res) => {

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
        clientId: process.env.TWITTER_CLIENT_ID,
    });

    let CALLBACL_URL = process.env.TWITTER_CALLBACK_URL;

    let { url, codeVerifier, state } = twitterClient.generateOAuth2AuthLink(
        CALLBACL_URL, {
        scope:
            [
                'users.read',
                'offline.access',
                'tweet.write'
            ]
    }
    );

    store(state, {
        codeVerifier: codeVerifier,
        address
    })

    res.status(200).send({
        "status": "success",
        "message": "Twitter Authenticated",
        "url": url
    });
});

twitterRouter.get('/callback', async (req, res) => {

    const { state, code } = req.query;

    if (!state || !code) {
        return res.redirect('/authenticate');
    }

    let codeVerifier, address;
    try {
        let res = store(state);
        codeVerifier = res.codeVerifier;
        address = res.address;
    } catch (error) {
        return res.redirect('/authenticate');
    }

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
        clientId: process.env.TWITTER_CLIENT_ID,
        clientSecret: process.env.TWITTER_CLIENT_SECRET,
    });

    const { client, accessToken, refreshToken, expiresIn } = await twitterClient.loginWithOAuth2({
        code,
        codeVerifier,
        redirectUri: process.env.TWITTER_CALLBACK_URL
    });

    const { data } = await client.v2.me();

    console.log(data);

    ownerData.twitter_auth_token = {
        accessToken: accessToken,
        refreshToken: refreshToken,
    }
    await ownerData.save();

    res.status(200).send({
        "status": "success",
        "message": "Twitter Authenticated"
    });

});


module.exports = twitterRouter;