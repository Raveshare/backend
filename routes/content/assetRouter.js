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

  if (author) {
    const assets = await assetSchema.findAll({
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

  let assets = await assetSchema.findAll({
    where: {
      author: query,
    },
  });

  finalAssets.push(assets);

  assets = await assetSchema.findAll({
    where: {
      tags: { [Op.contains]: [query] },
    },
  });

  finalAssets.concat(assets);

  res.send(finalAssets);
});

module.exports = assetRouter;
