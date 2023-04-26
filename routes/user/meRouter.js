const meRouter = require('express').Router();
const owner = require('../../schema/ownerSchema');

meRouter.get('/', async (req, res) => {
    res.send("Me Router");
});

meRouter.post('/create', async (req, res) => {
    let ownerData = req.body;
    let ownerDatas = await owner.create(ownerData);
    await ownerDatas.save();
    res.send(ownerDatas);
})

module.exports = meRouter;