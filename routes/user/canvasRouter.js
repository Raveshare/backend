const canvasRouter = require('express').Router();

const canvasSchema = require('../../schema/canvasSchema');
const ownerSchema = require('../../schema/ownerSchema');

const createPostViaDispatcher = require('../../lens/api').createPostViaDispatcher;
const uploadMetadataToIpfs = require('../../functions/uploadToIPFS').uploaddMetadataToIpfs;

canvasRouter.get('/ping', async (req, res) => {
    res.send("Canvas Router");
}

);

canvasRouter.get('/', async (req, res) => {
    let limit = req.query.limit || 50;
    let offset = req.query.offset || 0;

    let canvasDatas = await canvasSchema.findAll({
        limit: limit,
        offset: offset,
        order: [
            ['createdAt']
        ]
    });

    res.send(canvasDatas);
});

canvasRouter.get('/public', async (req, res) => {
    let limit = req.query.limit || 50;
    let offset = req.query.offset || 0;

    let canvasDatas = await canvasSchema.findAll({
        limit: limit,
        offset: offset,
        order: [
            ['createdAt']
        ],
        where: {
            isPublic: true
        }
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
    let canvasData = req.body.canvasData;
    let canvasId = canvasData.id;
    let visibility = canvasData.visibility;
    let isPublic = false;

    if (visibility == "public") {
        isPublic = true;
    }

    await canvasSchema.update({
        isPublic: isPublic
    }, {
        where: {
            id: canvasId
        }
    });

    res.status(200).send("Canvas Visibility Updated");
});

canvasRouter.post('/publish', async (req, res) => {
    let canvasId = req.body.canvasId;
    let name = req.body.name;
    let content = req.body.content;

    let canvasData = await canvasSchema.findOne({
        where: {
            id: canvasId
        }
    });

    let image = canvasData.imageLink;
    let ownerAddress = canvasData.ownerAddress;

    let owner = await ownerSchema.findOne({
        where: {
            address: ownerAddress
        }
    });

    let { accessToken, refreshToken } = owner.lens_auth_token;

    const postData = {
        name: name,
        content: content,
        image: image,
        handle: owner.lens_handle,
    }

    const ipfsData = await uploadMetadataToIpfs(postData);

    const createPostRequest = {
        profileId,
        contentURI: "ipfs://" + ipfsData.path,
        collectModule: {
            freeCollectModule: { followerOnly: true },
        },
        referenceModule: {
            followerOnlyReferenceModule: false,
        },
    };

    const result = await createPostViaDispatcher(createPostRequest, accessToken, refreshToken);

    res.send(result);

});


module.exports = canvasRouter;