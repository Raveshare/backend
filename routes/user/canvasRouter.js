const canvasRouter = require('express').Router();

const canvasSchema = require('../../schema/canvasSchema');
const ownerSchema = require('../../schema/ownerSchema');

const createPostViaDispatcher = require('../../lens/api').createPostViaDispatcher;
const uploadMetadataToIpfs = require('../../functions/uploadToIPFS').uploaddMetadataToIpfs;
const uploadMediaToIpfs = require('../../functions/uploadToIPFS').uploadMediaToIpfs;
const getImageBuffer = require('../../functions/getImageBuffer')
const uploadImageToS3 = require('../../functions/uploadImageToS3')

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

        let owner = await ownerSchema.findOne({
            where: {
                address: address
            }
        });

        await owner.addCanvas(canvas);

    } catch (error) {
        console.log(error);
        res.status(500).send(`Error: ${error}`);
    }

    res.status(200).send({
        "status": "success",
        "message": "Canvas Created",
        "canvasId": canvas.id
    });
});

canvasRouter.put('/update', async (req, res) => {
    let canvasData = req.body.canvasData;
    let ownerAddress = req.user.address;

    let canvas = await canvasSchema.findOne({
        where: {
            id: canvasData.id
        }
    });

    if (canvas.ownerAddress != ownerAddress) {
        res.status(401).send("Unauthorized");
        return;
    }

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

    let canvasData = req.body.canvasData;
    let ownerAddress = req.user.address;
    let platform = req.body.platform;

    let canvasId, name, content;

    try {

        canvasId = canvasData.id;
        name = canvasData.name;
        content = canvasData.content;

    } catch (error) {
        console.log(error);
        res.status(500).send(`Error: ${error}`);
    }

    if(!platform){
        res.status(400).send("Platform not specified");
        return;
    }


    let canvas = await canvasSchema.findOne({
        where: {
            id: canvasId
        }
    });

    if (canvas.ownerAddress != ownerAddress) {
        res.status(401).send("Unauthorized");
        return;
    }

    let owner = await ownerSchema.findOne({
        where: {
            address: ownerAddress
        }
    });

    let { accessToken, refreshToken } = owner.lens_auth_token;

    if (!accessToken || !refreshToken) {
        res.status(404).send("Owner not authenticated");
    }

    let json = JSON.stringify(canvas.data);


    if (!json) {
        res.status(404).send("Canvas data not found");
    }

    let image;
    try {
        image = await getImageBuffer(json);
        if (!image) {
            res.status(404).send("Canvas image not found");
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(`Error: ${error}`);
    }
    let cid = await uploadMediaToIpfs(image, "image/png");
    let imageLink = await uploadImageToS3(image, `${canvasId+name+content}.png`);


    canvas.ipfsLink = `ipfs://${cid}`;
    canvas.imageLink = imageLink;
    await canvas.save();

    let postMetadata = {
        name: name,
        content: content,
        handle: owner.lens_handle,
        image: `ipfs://${cid}`
    }

    const ipfsData = await uploadMetadataToIpfs(postMetadata);

    const createPostRequest = {
        "profileId": owner.profileId,
        "contentURI": "ipfs://" + ipfsData,
        "collectModule": {
            "freeCollectModule": { "followerOnly": true },
        },
        "referenceModule": {
            "followerOnlyReferenceModule": false,
        },
    };

    const result = await createPostViaDispatcher(createPostRequest,accessToken, refreshToken, ownerAddress);

    res.send(result);

});


module.exports = canvasRouter;