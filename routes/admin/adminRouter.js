const adminRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const dumpContent = require('../../scripts/dumpContent');

adminRouter.get('/', async (req, res) => {
    res.send("Admin Router");
});


adminRouter.get('/dumpContent', async (req, res) => {
    let collectionDetails = {
        address: "0x975d74900ef48F53Fa7d4F3550FA0C89f3B3c1Dc",
        name: "wgmis",
        openseaLink: "https://opensea.io/collection/wgmis",
        image : "https://i.seadn.io/gcs/files/8c0ddbb72f2c23a894218174c8272b72.gif"
    };

    let result = await dumpContent("wagmi.json", collectionDetails);

    res.send(result);
});

module.exports = adminRouter;