const adminRouter = require('express').Router();
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const dumpContent = require('../../scripts/dumpContent');
const dumpTemplate = require('../../scripts/dumpTemplate');

const dumpAsset = require('../../scripts/dumpAsset');
const deleteAsset = require('../../scripts/deleteAsset');

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

adminRouter.get('/dumpAsset' , async (req,res) => {
    let { name } = req.query;

    let result = await dumpAsset(name);

    res.send(result);
})

adminRouter.delete('/deleteAsset' , async (req,res) => {
    let result = await deleteAsset();
    res.send(result);
})


module.exports = adminRouter;