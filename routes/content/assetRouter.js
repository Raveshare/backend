const assetRouter = require("express").Router();
const { assetSchema } = require("../../schema/schema");
const { Op } = require("sequelize");

assetRouter.get("/by-author", async (req, res) => {
  const { author } = req.query;
  const assets = await assetSchema.find({ author });
  res.send(assets);
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
      tags: { [Op.contains] : [query] },
    },
  });

  finalAssets.concat(assets);

  res.send(finalAssets);
});


module.exports = assetRouter;
