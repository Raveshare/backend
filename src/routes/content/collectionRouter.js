const collectionRouter = require("express").Router();
const content = require("../../schema/content");
const collection = require("../../schema/collections");

const cache = require("../../middleware/cache");

collectionRouter.get("/ping", async (req, res) => {
  console.log("Collection Router");
  res.send("Collection Router");
});

collectionRouter.get("/:collection/", cache('5 hours') ,  async (req, res) => {
  let collectionAddress = req.params.collection;

  let page = req.query.page || 1;
  page = parseInt(page);

  page = page < 1 ? 1 : page;

  let limit = req.query.limit || 50;

  let offset = (page - 1) * limit;

  let collections = await collection.findOne({
    where: {
      address: collectionAddress,
    },
  });

  console.log(collections);

  let contents = await content.findAll({
    limit: limit,
    offset: offset,
    order: [["createdAt"]],
    where: {
      collectionId: collections.id,
    },
  });

  let totalAssets = await content.count({
    where: {
      collectionId: collections.id,
    },
  });

  let totalPage = Math.ceil(totalAssets / limit);

  res.send({
    assets: contents,
    totalPage: totalPage,
    nextPage: page + 1 > totalPage ? null : page + 1,
  });
});

collectionRouter.get("/:collection/:id",cache('5 hours') , async (req, res) => {
  let id = req.params.id;

  if (isNaN(id)) {
    res.status(400).send({
      status: "failed",
      message: "Invalid Request Parameters",
    });
    return;
  }

  let collectionAddress = req.params.collection;

  if (!collectionAddress) {
    res.status(400).send({
      status: "failed",
      message: "Invalid Request Parameters",
    });
    return;
  }

  let collections = await collection.findOne({
    where: {
      address: collectionAddress,
    },
  });

  let contents = await content.findOne({
    where: {
      id: id,
      collectionId: collections.id,
    },
  });

  res.send(contents);
});

collectionRouter.get("/", cache('5 hours') ,async (req, res) => {
  let page = req.query.page || 1;
  page = parseInt(page);

  page = page < 1 ? 1 : page;

  let limit = req.query.limit || 50;

  let offset = (page - 1) * limit;

  let collections = await collection.findAll({
    limit: limit,
    offset: offset,
    order: [["createdAt"]],
  });

  let totalAssets = await collection.count();

  let totalPage = Math.ceil(totalAssets / limit);

  res.send({
    assets: collections,
    totalPage: totalPage,
    nextPage: page + 1 > totalPage ? null : page + 1,
  });
});

module.exports = collectionRouter;
