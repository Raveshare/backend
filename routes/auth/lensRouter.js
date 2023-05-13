const lensRouter = require('express').Router();

const challenge = require('../../lens/api').challenge;
const authenticate = require('../../lens/api').authenticate;
const getFollowContractAddress = require('../../lens/api').getFollowContractAddress;
const getProfileHandleAndId = require('../../lens/api').getProfileHandleAndId


const ownerSchema = require('../../schema/ownerSchema');

lensRouter.get('/challenge', async (req, res) => {
    let address = req.user.address;
    console.log(address);
    let challengeData = await challenge(address);
    res.status(200).send({
        "challenge": challengeData
    })
});

lensRouter.post('/authenticate', async (req, res) => {
    let address = req.user.address;
    let signature

    try {
        signature = req.body.signature;
    } catch (error) {
        res.status(400).send({
            "status": "failed",
            "message": "Invalid Request Parameters"
        });
        return;
    }

    try {
        let authenticateData = await authenticate(address, signature);
        const { accessToken, refreshToken } = authenticateData;

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

        let { handle , id } = await getProfileHandleAndId(address);
        let followNftAddress = await getFollowContractAddress(id);

        ownerData.profileId = id;
        ownerData.followNftAddress = followNftAddress;
        ownerData.lens_handle = handle;

        ownerData.lens_auth_token = {
            accessToken: accessToken,
            refreshToken: refreshToken
        }
        await ownerData.save();

        res.status(200).send({
            "status": "success",
        })

    } catch (error) {
        res.status(400).send({
            "status": "failed",
            "message": `Invalid Server Error: ${error}`
        });
    }

});

module.exports = lensRouter;