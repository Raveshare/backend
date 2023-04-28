const canvasRouter = require('express').Router();

const canvasSchema = require('../../schema/canvasSchema');

canvasRouter.get('/', async (req, res) => {
    res.send("Canvas Router");
}

);

canvasRouter.get('/all', async (req, res) => {
    let limit = req.query.limit || 50;
    let offset = req.query.offset || 0;

    let canvasDatas = await canvas.findAll({
        limit: limit,
        offset: offset,
        order: [
            ['createdAt']
        ]
    });

    res.send(canvasDatas);
});


canvasRouter.get('/:id', async (req, res) => {
    let id = req.params.id;
    let canvasDatas = await canvasSchema.findOne({
        where: {
            id: id
        }
    });

    res.send(canvasDatas);
})

canvasRouter.post('/create', async (req, res) => {
    let canvasData = req.body.canvasData;
    await canvasSchema.create(canvasData);

    res.status(200).send("Canvas Created");
});

canvasRouter.put('/update', async (req, res) => {
    let canvasData = req.body.canvasData;
    await canvasSchema.update(canvasData, {
        where: {
            id: canvasData.id
        }
    });

    res.status(200).send("Canvas Updated");
});

canvasRouter.put('/visibility', async (req, res) => {
    let canvasId = req.body.canvasId;
    let visibility = req.body.visibility;
    let isPublic = false;

    if(visibility == "public") {
        isPublic = true;
    }

    await canvasSchema.update({
        isPublic : isPublic
    }, {
        where : {
            id : canvasId
        }
    });
});

module.exports = canvasRouter;