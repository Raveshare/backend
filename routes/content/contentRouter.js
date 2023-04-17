const contentRouter = require('express').Router();
const content = require('../../schema/content');

contentRouter.get('/', async (req, res) => {
    res.send("Content Router");
});

contentRouter.get('/all', async (req, res) => {
    let limit = req.query.limit || 50;
    let offset = req.query.offset || 0;

    let contents = await content.findAll({
        limit: limit,
        offset: offset,
        order : [
            ['createdAt']
        ]
    });

    res.send(contents);
}); 

contentRouter.get('/:id', async (req, res) => {
    let id = req.params.id;
    let contents = await content.findOne({
        where : {
            id : id
        }
    });

    res.send(contents);
});

module.exports = contentRouter;