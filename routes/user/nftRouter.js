const nftRouter = require('express').Router();
const nftSchema = require('../../schema/nftSchema');
const ownerSchema = require('../../schema/ownerSchema');

const getNftsForOwner = require("../../functions/getNftsForOwner")

const sendError = require("../../functions/webhook/sendError.webhook");

nftRouter.get('/', async (req, res) => {
    res.send("NFT Router");
}
);

nftRouter.get('/all', async (req, res) => {

    let limit = req.query.limit || 50;
    let offset = req.query.offset || 0;

    let nftDatas = await nftSchema.findAll({
        limit: limit,
        offset: offset,
        order: [
            ['createdAt']
        ]
    });

    res.send(nftDatas);
});


nftRouter.get('/owned', async (req, res) => {
    let address = req.user.address;

    let nfts = await nftSchema.findAll({
        where: {
            ownerAddress: address
        }
    });

    res.status(200).send(nfts);
});

nftRouter.post('/update', async (req, res) => {
    let address = req.user.address;

    let nftDump = await getNftsForOwner(address);
    let nfts = nftDump["nftMetadata"];

    try {
        for (let i = 0; i < nfts.length; i++) {
            let nft = nfts[i];
            let nftData = await nftSchema.findOne({
                where: {
                    address: nft["address"],
                    tokenId: nft["tokenId"]
                }
            });
            if (nftData == null) {
                try {
                    nftData = await nftSchema.create(nft);
                    let owner = await ownerSchema.findOne({
                        where: {
                            address: address
                        }
                    });
                    if (!owner) {
                        return res.status(404).send("Owner not found");
                    }
                    nftData.setOwner(owner);
                    nftData.save();
                } catch (error) {
                    sendError(error + address);
                    console.log(error);
                    console.log(nft);
                }
            }
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send("Error: " + error);
    }

    res.status(200).send("NFTs updated");
});



nftRouter.get('/:id', async (req, res) => {
    if (!req.params.id) {
        res.status(400).send({
            "status": "failed",
            "message": "Invalid Request Parameters"
        });
        return;
    }
    let id = req.params.id;
    let nftDatas = await nftSchema.findOne({
        where: {
            id: id
        }
    });

    res.send(nftDatas);
}
);


module.exports = nftRouter;