const adminRouter = require('express').Router();
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const dumpContent = require('../../scripts/dumpContent');
const dumpTemplate = require('../../scripts/dumpTemplate');

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

adminRouter.get('/dumpTemplate' , async (req,res) => {
    let { name } = req.query;

    let result = await dumpTemplate(name);

    res.send(result);
})

module.exports = adminRouter;