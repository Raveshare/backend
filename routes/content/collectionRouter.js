const collectionRouter = require('express').Router();
const content = require('../../schema/content');
const collection = require('../../schema/collections');

collectionRouter.get('/ping', async (req, res) => {
    res.send("Collection Router");
});

collectionRouter.get('/:collection/', async (req, res) => {

    let collectionAddress = req.params.collection;

    let limit = req.query.limit || 50;
    let offset = req.query.offset || 0;

    let collections = await collection.findOne({
        where: {
            address: collectionAddress
        }
    });

    let contents = await content.findAll({
        limit: limit,
        offset: offset,
        order: [
            ['createdAt']
        ],
        where: {
            collectionId: collections.id
        }
    });

    res.send(contents);
});

collectionRouter.get('/:collection/:id', async (req, res) => {
    let id = req.params.id;
    let collectionAddress = req.params.collection;

    let collections = await collection.findOne({
        where: {
            address: collectionAddress
        }
    });

    let contents = await content.findOne({
        where: {
            id: id,
            collectionId : collections.id
        }
    });

    res.send(contents);
});

collectionRouter.get('/', async (req, res) => {
    let limit = req.query.limit || 50;
    let offset = req.query.offset || 0;

    let collections = await collection.findAll({
        limit: limit,
        offset: offset,
        order: [
            ['createdAt']
        ]
    });

    res.send(collections);
});

module.exports = collectionRouter;