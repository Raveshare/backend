const assetRouter = require("express").Router();
const { assetSchema } = require("../../schema/schema");

const cache = require("../../middleware/cache");

assetRouter.get("/featured", cache("5 hours"), async (req, res) => {
  let type = req.query.type || "props";

  let page = req.query.page || 1;
  page = parseInt(page);

  page = page < 1 ? 1 : page;

  let limit = req.query.limit || 20;

  let offset = (page - 1) * limit;

  const assets = await assetSchema.findAll({
    where: {
      featured: true,
      type: type,
    },
    limit: limit,
    offset: offset,
  });

  let totalAssets = await assetSchema.count({
    where: {
      featured: true,
      type: type,
    },
  });

  let totalPage = Math.ceil(totalAssets / limit);

  res.send({
    assets: assets,
    totalPage: totalPage,
    nextPage: page + 1 > totalPage ? null : page + 1,
  });
});

assetRouter.get("/", cache("5 hours"), async (req, res) => {
  const { author, type } = req.query;

  let page = req.query.page || 1;
  page = parseInt(page);

  page = page < 1 ? 1 : page;

  let limit = req.query.limit || 50;

  let offset = (page - 1) * limit;

  if(!type) {
    res.status(400).send({
      message: "Type is required"
    })
  }

  if (author) {
    const assets = await assetSchema.findAll({
      limit: limit,
      offset: offset,
      where: {
        author: author,
        type: type,
      },
      order: [["createdAt", "DESC"]],
    });

    let totalAssets = await assetSchema.count({
      where: {
        author: author,
        type: type,
      },
    });

    let totalPage = Math.ceil(totalAssets / limit);

    res.send({
      assets: assets,
      totalPage: totalPage,
      nextPage: page + 1 > totalPage ? null : page + 1,
    });
    return;
  } else {

    const assets = await assetSchema.findAll({
      limit: limit,
      offset: offset,
      where: {
        type: type,
      },
      order: [["createdAt", "DESC"]],
    });

    let totalAssets = await assetSchema.count({
      where: {
        type: type,
      },
      order: [["createdAt", "DESC"]],
    });

    let totalPage = Math.ceil(totalAssets / limit);

    res.send({
      assets: assets,
      totalPage: totalPage,
      nextPage: page + 1 > totalPage ? null : page + 1,
    });
    return;
  }
});

module.exports = assetRouter;
