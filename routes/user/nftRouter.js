const nftRouter = require('express').Router();
const nftSchema = require('../../schema/nftSchema');
const ownerSchema = require('../../schema/ownerSchema');

const getNftsForOwner = require("../../functions/getNftsForOwner")

nftRouter.get('/', async (req, res) => {
    res.send("NFT Router");
}
);

nftRouter.get('/all', async (req, res) => {
    let limit = req.query.limit || 50;
    let offset = req.query.offset || 0;

    let nftDatas = await nftData.findAll({
        limit: limit,
        offset: offset,
        order: [
            ['createdAt']
        ]
    });

    res.send(nftDatas);
});

nftRouter.get('/:id', async (req, res) => {
    let id = req.params.id;
    let nftDatas = await nftData.findOne({
        where: {
            id: id
        }
    });

    res.send(nftDatas);
}
);

nftRouter.post('/create', async (req, res) => {
    let nftData = req.body;
    let nftDatas = await nftData.create(nftData);

    res.send(nftDatas);
});

nftRouter.post('/update', async (req, res) => {
    let address = req.body.address;

    let nftDump = await getNftsForOwner(address);
    let nfts = nftDump["nftMetadata"];
    
    for(let i = 0; i < nfts.length; i++){
        let nft = nfts[i];
        let nftData = await nftSchema.findOne({
            where : {
                address : nft["address"],
                tokenId : nft["tokenId"]
            }
        });
        if(nftData == null){
            nftData = await nftSchema.create(nft);
            let owner = await ownerSchema.findOne({
                where : {
                    address : address
                }
            });
            if(!owner){
                return res.status(404).send("Owner not found");
            }
            nftData.setOwner(owner);
            nftData.save();
        }
    }

});
        

module.exports = nftRouter;