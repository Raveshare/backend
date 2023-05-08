const canvasRouter = require('express').Router();

const canvasSchema = require('../../schema/canvasSchema');
const ownerSchema = require('../../schema/ownerSchema');

const createPostViaDispatcher = require('../../lens/api').createPostViaDispatcher;
const uploadMetadataToIpfs = require('../../functions/uploadToIPFS').uploaddMetadataToIpfs;
const uploadMediaToIpfs = require('../../functions/uploadToIPFS').uploadMediaToIpfs;
const getImageBuffer = require('../../functions/getImageBuffer')

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
    if (!req.params.id) {
        res.status(400).send({
            "status": "failed",
            "message": "Invalid Request Parameters"
        });
        return;
    }
    let id = req.params.id;
    let canvasDatas = await canvasSchema.findOne({
        where: {
            id: id
        }
    });

    res.send(canvasDatas);
})

canvasRouter.post('/create', async (req, res) => {
    let address, canvasData
    address = req.user.address;
    try {
        canvasData = req.body.canvasData;
    } catch (error) {
        console.log(error);
        res.status(500).send(`Error: ${error}`);
    }
    try {
        canvas = await canvasSchema.create(canvasData);

        let owner = await ownerSchema.create({
            where: {
                address: address,
            }
        });

        await owner.addCanvas(canvas);

    } catch (error) {
        console.log(error);
        res.status(500).send(`Error: ${error}`);
    }

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

    let canvasId, name, content;

    try {

        canvasId = req.body.canvasId;
        name = req.body.name;
        content = req.body.content;

    } catch (error) {
        console.log(error);
        res.status(500).send(`Error: ${error}`);
    }


    let canvasData = await canvasSchema.findOne({
        where: {
            id: canvasId
        }
    });

    let ownerAddress = canvasData.ownerAddress;

    let owner = await ownerSchema.findOne({
        where: {
            address: ownerAddress
        }
    });

    if (!owner) {
        res.status(404).send("Owner not found");
    }


    let { accessToken, refreshToken } = owner.lens_auth_token;

    if (!accessToken || !refreshToken) {
        res.status(404).send("Owner not authenticated");
    }

    let json = JSON.stringify(canvasData.data);

    if (!json) {
        res.status(404).send("Canvas data not found");
    }

    let image = await getImageBuffer(json);

    let cid = await uploadMediaToIpfs(image);

    canvasData.image = image;
    await canvasData.save();

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