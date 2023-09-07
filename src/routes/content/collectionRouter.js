const collectionRouter = require("express").Router();
const prisma = require("../../prisma");

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

  // let collections = await prisma.collections.findUnique({
  //   where: {
  //     address: collectionAddress,
  //   },
  // });

  let collections = await prisma.collections.findFirst({
    where: {
      address : {
        equals : collectionAddress,
        mode : 'insensitive'
      }
    },
  });

  let contents = await prisma.contents.findMany({
    take: limit,
    skip: offset,
    orderBy : {
      createdAt: "desc",
    },
    where: {
      collectionId: collections.id,
    },
  });

  let totalAssets = await prisma.contents.count({
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

  let collections = await prisma.collections.findFirst({
    where: {
      address : {
        equals : collectionAddress,
        mode : 'insensitive'
      }
    },
  });

  let contents = await prisma.contents.findFirst({
    where: { 
      AND : [
        {
          id: {
            equals: parseInt(id),
          }
        },
        {
          collectionId: {
            equals: collections.id,
          }
        }
      ]
    },
  });

  res.send({
    assets: contents,
  });
});

collectionRouter.get("/", cache('5 hours') ,async (req, res) => {
  let page = req.query.page || 1;
  page = parseInt(page);

  page = page < 1 ? 1 : page;

  let limit = req.query.limit || 20;

  let offset = (page - 1) * limit;

  let collections = await prisma.collections.findMany({
    take: limit,
    skip: offset,
    orderBy : {
      createdAt : "desc"
    }
  });

  let totalAssets = await prisma.collections.count({});

  let totalPage = Math.ceil(totalAssets / limit);

  res.send({
    assets: collections,
    totalPage: totalPage,
    nextPage: page + 1 > totalPage ? null : page + 1,
  });
});

module.exports = collectionRouter;
