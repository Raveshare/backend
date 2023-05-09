const authRouter = require('express').Router();
const lensRouter = require('./lensRouter');

const verifySignature = require('../../utils/auth/verifySignature');
const generateJwt = require('../../utils/auth/generateJwt');
const auth = require('../../middleware/auth/auth');
const getProfileHandle = require('../../lens/api').getProfileHandle;

const ownerSchema = require('../../schema/ownerSchema');

authRouter.get('/', async (req, res) => {
    res.send("Auth Router");
});

authRouter.post('/login', async (req, res) => {

    let address, signature, message;

    try {
        signature = req.body.signature;
        message = req.body.message;
        address = req.body.address;
    } catch (error) {
        res.status(400).send({
            "status": "failed",
            "message": "Invalid Request Parameters"
        });
        return;
    }

    try {

        let isVerified = await verifySignature(address, signature, message);
        if (isVerified) {

            let ownerData = await ownerSchema.findOne({
                where: {
                    address: address
                }
            });

            if (ownerData == null) {
                let handle = await getProfileHandle(address);
                ownerData = await ownerSchema.create({
                    address: address,
                    lens_handle: handle
                });
                await ownerData.save();
            }

            let jwt = await generateJwt(address, signature);

            res.status(200).send({
                "status": "success",
                "message": "Signature Verified",
                "jwt": jwt
            });
        } else {
            res.status(200).send({
                "status": "failed",
                "message": "Signature Verification Failed"
            });
        }
    } catch (error) {
        res.status(500).send({
            "status": "failed",
            "message": `Internal Server Error ${error.message}`
        });
    }
});


authRouter.use('/lens', auth, lensRouter);

module.exports = authRouter;