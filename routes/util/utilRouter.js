const utilRouter = require('express').Router();

const uploadCanvasToIpfs = require('../../functions/uploadCanvasToIpfs');
const checkDispatcher = require('../../lens/api').checkDispatcher;

utilRouter.get('/', async (req, res) => {
    res.send("Util Router");
});

utilRouter.post('/uploadCanvasImage', async (req, res) => {
    let blob = req.body.blob;
    let name = req.body.name;
    let description = req.body.description;
    let fileType = req.body.fileType;
    // let result = await uploadCanvasToIpfs(blob, name, description,fileType)
    res.send(result);
});


utilRouter.get('/checkDispatcher', async (req, res) => {
    let profileId = req.body.profileId;
    let result = await checkDispatcher(profileId);
    res.send(result);
});

module.exports = utilRouter;