const nftRouter = require("express").Router();
const nftSchema = require("../../schema/nftSchema");
const ownerSchema = require("../../schema/ownerSchema");

const getNftsForOwner = require("../../functions/getNftsForOwner");

const sendError = require("../../functions/webhook/sendError.webhook");

nftRouter.get("/", async (req, res) => {
  res.send("NFT Router");
});

nftRouter.get("/all", async (req, res) => {
  let page = req.query.page || 1;
  page = parseInt(page);

  page = page < 1 ? 1 : page;

  let limit = req.query.limit || 50;

  let offset = (page - 1) * limit;

  let nftDatas = await nftSchema.findAll({
    limit: limit,
    offset: offset,
    order: [["createdAt"]],
  });

  let totalAssets = await nftSchema.count();
  let totalPage = Math.ceil(totalAssets / limit);

  res.send({
    assets: nftDatas,
    totalPage: totalPage,
    nextPage: page + 1 > totalPage ? null : page + 1,
  });
});

nftRouter.get("/owned", async (req, res) => {
  let address = req.user.address;

  let page = req.query.page || 1;
  page = parseInt(page);

  page = page < 1 ? 1 : page;

  let limit = req.query.limit || 50;

  let offset = (page - 1) * limit;

  let nfts = await nftSchema.findAll({
    limit: limit,
    offset: offset,
    order: [["createdAt"]],
    where: {
      ownerAddress: address,
    },
  });

  let totalAssets = await nftSchema.count({
    where: {
      ownerAddress: address,
    },
  });

  let totalPage = Math.ceil(totalAssets / limit);

  res.send({
    assets: nfts,
    totalPage: totalPage,
    nextPage: page + 1 > totalPage ? null : page + 1,
  });
});

nftRouter.post("/update", async (req, res) => {
  let address = req.user.address;

  let nftDump = await getNftsForOwner(address);
  let nfts = nftDump["nftMetadata"];

  try {
    for (let i = 0; i < nfts.length; i++) {
      let nft = nfts[i];
      let nftData = await nftSchema.findOne({
        where: {
          address: nft["address"],
          tokenId: nft["tokenId"],
        },
      });
      if (nftData == null) {
        try {
          nftData = await nftSchema.create(nft);
          let owner = await ownerSchema.findOne({
            where: {
              address: address,
            },
          });
          if (!owner) {
            return res.status(404).send({
              status: "failed",
              message: "Owner not found",
            });
          }
          nftData.setOwner(owner);
          nftData.save();
        } catch (error) {
          sendError(`${error} - ${address} - /nft/update`);
          console.log(error);
          console.log(nft);
        }
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: "error",
      message: "Internal Server Error",
    });
  }

  res.status(200).send({
    status: "success",
    message: "NFTs updated",
  });
});

nftRouter.get("/:id", async (req, res) => {
  let ownerAddress = req.user.address;

  if (!req.params.id) {
    res.status(400).send({
      status: "failed",
      message: "Invalid Request Parameters",
    });
    return;
  }

  let id = req.params.id;

  if (isNaN(id)) {
    res.status(400).send({
      status: "failed",
      message: "Invalid Request Parameters",
    });
    return;
  }

  let nftData = await nftSchema.findOne({
    where: {
      id: id,
    },
  });

  if (!nftData) {
    res.status(404).send({
      status: "failed",
      message: "NFT not found",
    });
    return;
  }

  if (nftData.ownerAddress != ownerAddress) {
    res.status(401).send({
      status: "error",
      message: "forbidden",
    });
    return;
  }

  res.send(nftData);
});

module.exports = nftRouter;
