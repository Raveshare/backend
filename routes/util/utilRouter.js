const utilRouter = require('express').Router();
const multer = require('multer');

const checkDispatcher = require('../../lens/api').checkDispatcher;
const ownerSchema = require('../../schema/ownerSchema');

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

utilRouter.post('/updateFollowerCallback', async (req, res) => {
    let data = req.body;
    let activity = data.event.activity[0];
    let toAddress = activity.toAddress;
    let contractAddress = activity.contractAddress;
    let event;
    if (toAddress == "0x0000000000000000000000000000000000000000") {
        event = "unfollow";
        tokenId = activity.erc721TokenId;
    } else {
        event = "follow";
        tokenId = activity.erc721TokenId;
    }
    let ownerData = await ownerSchema.findOne({
        where: {
            followNftAddress: contractAddress
        }
    });
    if (ownerData) {
        console.log("Owner Data: ", ownerData); ;
    } else {
        console.log("Owner Data Not Found");
    }
    

    console.log("Follower Callback: ", event, tokenId);
})

utilRouter.get('/checkDispatcher', async (req, res) => {
    let profileId = req.body.profileId;
    let result = await checkDispatcher(profileId);
    res.send(result);
});

module.exports = utilRouter;