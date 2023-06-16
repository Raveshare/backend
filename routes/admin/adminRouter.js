const adminRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const dumpContent = require('../../scripts/dumpContent');

adminRouter.get('/', async (req, res) => {
    res.send("Admin Router");
});


adminRouter.get('/dumpContent', async (req, res) => {


    let { address , name, openseaLink, image , filename } = req.query;

    let collectionDetails = {
        address: address,
        name: name,
        openseaLink: openseaLink,
        image : image
    };

    let result = await dumpContent(filename, collectionDetails);

    res.send(result);
});

module.exports = adminRouter;