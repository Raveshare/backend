const utilRouter = require('express').Router();

const uploadCanvasToIpfs = require('../../functions/uploadCanvasToIpfs');

utilRouter.get('/', async (req, res) => {
    res.send("Util Router");
});

utilRouter.post('/uploadCanvasImage', async (req, res) => {
    let blob = req.body.blob;
    let name = req.body.name;
    let fileType = req.body.fileType;
    let result = await uploadCanvasToIpfs(blob, name, fileType);
    res.send(result);
});

module.exports = utilRouter;