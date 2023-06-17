const canvasRouter = require('express').Router();

const canvasSchema = require('../../schema/canvasSchema');
const ownerSchema = require('../../schema/ownerSchema');

const uploadMediaToIpfs = require('../../functions/uploadToIPFS').uploadMediaToIpfs;
const getImageBuffer = require('../../functions/getImageBuffer')
const uploadImageToS3 = require('../../functions/uploadImageToS3')
const uploadToLens = require('../../functions/uploadToLens');
const uploadToTwitter = require('../../functions/uploadToTwitter');

const canvasCreated = require('../../functions/events/canvasCreated.event');
const canvasPostedToTwitter = require('../../functions/events/canvasPostedToTwitter.event');
const canvasPostedToLens = require('../../functions/events/canvasPostedToLens.event');
const canvasMadePublic = require('../../functions/events/canvasMadePublic.event');

const sendError = require('../../functions/webhook/sendError.webhook');

canvasRouter.get('/ping', async (req, res) => {
    res.send("Canvas Router");
}

);

canvasRouter.get('/', async (req, res) => {
    let limit = req.query.limit || 50;
    let offset = req.query.offset || 0;
    let address = req.user.address;

    let canvasDatas = await canvasSchema.findAll({
        limit: limit,
        offset: offset,
        order: [
            ['createdAt']
        ],
        where: {
            ownerAddress: address
        }
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
        return;
    }
    try {
        canvas = await canvasSchema.create(canvasData);

        let owner = await ownerSchema.findOne({
            where: {
                address: address
            }
        });

        await owner.addCanvas(canvas);

        let image;
        try {
            let json = JSON.stringify(canvas.data);
            console.log(json);
            image = await getImageBuffer(json);
            if (!image) {
                res.status(404).send("Canvas image not found");
                return;
            }
        } catch (error) {
            console.log(error);
            res.status(500).send(`Error: ${error}`);
            return;
        }

        let cid = [], imageLink = [];

        for (let i = 0; i < image.length; i++) {
            cid.push(await uploadMediaToIpfs(image[i], "image/png"))
            let filepath = `user/${address}/${canvas.id}-${i}.png`;
            imageLink.push(await uploadImageToS3(image[i], filepath));
        }

        console.log(cid, imageLink)

        canvas.ipfsLink = cid;
        canvas.imageLink = imageLink;
        await canvas.save();

        res.status(200).send({
            "status": "success",
            "message": "Canvas Created",
            "canvasId": canvas.id
        });

        canvasCreated(canvas.id, address);

    } catch (error) {
        console.log(error);
        res.status(500).send(`Error: ${error}`);
        return;
    }

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

    let image;
    try {
        image = await getImageBuffer(json);
        if (!image) {
            res.status(404).send("Canvas image not found");
            return;
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(`Error: ${error}`);
        return;
    }

    let cid = [], imageLink = [];

    for (let i = 0; i < image.length; i++) {
        cid.push(await uploadMediaToIpfs(image[i], "image/png"))
        let filepath = `user/${ownerAddress}/${canvas.id}-${i}.png`;
        imageLink.push(await uploadImageToS3(image[i], filepath));
    }

    canvas.ipfsLink = cid;
    canvas.imageLink = imageLink;
    await canvas.save();

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

    canvasMadePublic(canvasId, req.user.address);

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
        return;
    }

    if (!platform) {
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

    let json = JSON.stringify(canvas.data);


    if (!json) {
        res.status(404).send("Canvas data not found");
        return;
    }

    let image;
    try {
        image = await getImageBuffer(json);
        if (!image) {
            res.status(404).send("Canvas image not found");
            return;
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(`Error: ${error}`);
        return;
    }

    let cid = [], imageLink = [];

    for (let i = 0; i < image.length; i++) {
        cid.push(await uploadMediaToIpfs(image[i], "image/png"))
        let filepath = `user/${ownerAddress}/${canvas.id}-${i}.png`;
        imageLink.push(await uploadImageToS3(image[i], filepath));
    }

    canvas.ipfsLink = cid;
    canvas.imageLink = imageLink;
    await canvas.save();

    let resp;
    if (platform == "lens") {

        let postMetadata = {
            name: name,
            content: content,
            handle: owner.lens_handle,
            image: cid
        }

        resp = await uploadToLens(postMetadata, owner);
        canvasPostedToLens(canvasId, ownerAddress);
    } else if (platform == "twitter") {
        resp = await uploadToTwitter(postMetadata, owner);
        canvasPostedToTwitter(canvasId, ownerAddress);
    }



    res.send(resp);

});

canvasRouter.delete('/delete/:id', async (req, res) => {
    let canvasId = req.params.id;
    let ownerAddress = req.user.address;

    let canvas = await canvasSchema.findOne({
        where: {
            id: canvasId
        }
    });

    if (canvas.ownerAddress != ownerAddress) {
        res.status(401).send("Unauthorized");
        return;
    }

    await canvasSchema.destroy({
        where: {
            id: canvasId
        }
    });

    res.status(200).send({
        "status": "success",
        "message": "Canvas Deleted"
    })
});


module.exports = canvasRouter;