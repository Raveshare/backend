const lensRouter = require('./routes/auth/lensRouter');

const challenge = require('../../lens/api').challenge;
const authenticate = require('../../lens/api').authenticate;

const ownerSchema = require('../../schema/ownerSchema');

lensRouter.get('/challenge/:address', async (req, res) => {
    let address = req.params.address;
    let challengeData = await challenge(address);
    res.status(200).send({
        "challenge": challengeData
    })
});

lensRouter.post('/authenticate', async (req, res) => {
    let address = req.body.address;
    let signature = req.body.signature;

    let authenticateData = await authenticate(address, signature);
    res.status(200).send({
        "status": "success",
    })
});

module.exports = lensRouter;