const assetRouter = require('express').Router();
const { assetSchema } = require('../../schema/schema');

assetRouter.get('/by-author' , async (req,res) => {
    const { author } = req.query;
    const assets = await assetSchema.find({ author });
    res.send(assets);
})

module.exports = assetRouter;