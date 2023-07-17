const assetRouter = require("express").Router();
const { assetSchema } = require("../../schema/schema");
const { Op } = require("sequelize");

assetRouter.get("/by-author", async (req, res) => {
  const { author } = req.query;
  const assets = await assetSchema.find({ author });
  res.send(assets);
});

assetRouter.get("/background", async (req, res) => {
  const { author } = req.query;

  let page = req.query.page || 1;
  page = parseInt(page);

  page = page < 1 ? 1 : page;

  let limit = req.query.limit || 50;

  let offset = (page - 1) * limit;

  if (author) {
    const assets = await assetSchema.findAll({
      limit: limit,
      offset: offset,
      where: {
        author: author,
        type: "background",
      },
      order: [["createdAt", "DESC"]],
    });

    let totalAssets = await assetSchema.count({
      where: {
        author: author,
        type: "background",
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
        type: "background",
      },
      order: [["createdAt", "DESC"]],
    });

    let totalAssets = await assetSchema.count({
      where: {
        type: "background",
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

assetRouter.get("/", async (req, res) => {
  const { query } = req.query;

  let finalAssets = [];

  let page = req.query.page || 1;
  page = parseInt(page);

  page = page < 1 ? 1 : page;

  let limit = req.query.limit || 50;

  let offset = (page - 1) * limit;

  if (query) {
    let assets = await assetSchema.findAll({
      limit: limit,
      offset: offset,
      where: {
        [Op.and]: [{ author: query }, { type: "props" }],
      },
    });

    let totalAssets = await assetSchema.count({
      where: {
        [Op.and]: [{ author: query }, { type: "props" }],
      },
    });

    let totalPage = Math.ceil(totalAssets / limit);

    finalAssets = finalAssets.concat(assets);

    assets = await assetSchema.findAll({
      limit: limit,
      offset: offset,
      where: {
        [Op.and]: [{ tags: { [Op.contains]: [query] } }, { type: "props" }],
      },
    });

    totalAssets = await assetSchema.count({
      where: {
        [Op.and]: [{ tags: { [Op.contains]: [query] } }, { type: "props" }],
      },
    });

    totalPage += Math.ceil(totalAssets / limit);

    finalAssets = finalAssets.concat(assets);

    res.send({
      assets: finalAssets,
      totalPage: totalPage,
      nextPage: page + 1 > totalPage ? null : page + 1,
    });
    return;
  } else {
    // let assets = await assetSchema.findAll();
    let assets = await assetSchema.findAll({
      limit: limit,
      offset: offset,
      where: {
        type: "props",
      },
    });

    let totalAssets = await assetSchema.count({
      where: {
        type: "props",
      },
    });

    let totalPage = Math.ceil(totalAssets / limit);

    finalAssets = finalAssets.concat(assets);

    res.send({
      assets: finalAssets,
      totalPage: totalPage,
      nextPage: page + 1 > totalPage ? null : page + 1,
    });
    return;
  }
});

module.exports = assetRouter;
