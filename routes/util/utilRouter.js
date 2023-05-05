const utilRouter = require('express').Router();
const multer = require('multer');

const checkDispatcher = require('../../lens/api').checkDispatcher;
const uploadMediaToIpfs = require('../../functions/uploadToIPFS').uploadMediaToIpfs;
const canvasSchema = require('../../schema/canvasSchema');

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10000000
    }
});

utilRouter.get('/', async (req, res) => {
    res.send("Util Router");
});

utilRouter.post('/uploadCanvasToIpfs', upload.single('canvas'), async (req, res) => {
    let blob = req.file.buffer;
    let fileType = req.file.mimetype;
    let canvasId = req.body.canvasId;

    let result = await uploadMediaToIpfs(blob, fileType);

    let canvas = await canvasSchema.findOneAndUpdate({ _id: canvasId }, { $set: { ipfsHash: result } }, { new: true });

    res.send({
        result: result,
    });
});

utilRouter.get('/checkDispatcher', async (req, res) => {
    let profileId = req.body.profileId;
    let result = await checkDispatcher(profileId);
    res.send(result);
});

module.exports = utilRouter;