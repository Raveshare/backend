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

  let limit = req.query.limit || 50;
  let offset = req.query.offset || 0;

  if (author) {
    const assets = await assetSchema.findAll({
      limit: limit,
      offset: offset,
      where: {
        author: author,
        type: "background",
      },
    });

    res.send(assets);
    return;
  } else {
    const assets = await assetSchema.findAll({
      where: {
        type: "background",
      },
    });

    res.send(assets);
    return;
  }
});

assetRouter.get("/", async (req, res) => {
  let finalAssets = [];

  const query = req.query.query;

  let limit = req.query.limit || 50;
  let offset = req.query.offset || 0;

  if (query) {
    let assets = await assetSchema.findAll({
      limit: limit,
      offset: offset,
      where: {
        [Op.and]: [{ author: query }, { type: "props" }],
      },
    });

    finalAssets = finalAssets.concat(assets);

    assets = await assetSchema.findAll({
      limit: limit,
      offset: offset,
      where: {
        [Op.and]: [{ tags: { [Op.contains]: [query] } }, { type: "props" }],
      },
    });

    // console.log(assets);

    // assets = assets.findAll()

    finalAssets = finalAssets.concat(assets);

    res.send(finalAssets);
    return;
  } else {
    let assets = await assetSchema.findAll();

    res.send(assets);
  }
});

module.exports = assetRouter;
