const meRouter = require('express').Router();
const owner = require('../../schema/ownerSchema');

meRouter.get('/', async (req, res) => {
    res.send("Me Router");
});

meRouter.post('/', async (req, res) => {
    let ownerData = req.body;
    let ownerDatas = await owner.create(ownerData);
    await ownerDatas.save();
    res.send({
        "status": "success",
    });
})

meRouter.put('/', async (req, res) => {
    let ownerData = req.body;
    let ownerDatas = await owner.update(ownerData, {
        where: {
            id: ownerData.id
        }
    });
    await ownerDatas.save();
    res.send({
        "status": "success",
    })
})

module.exports = meRouter;