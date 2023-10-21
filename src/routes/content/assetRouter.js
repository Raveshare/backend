const assetRouter = require("express").Router();

const prisma = require("../../prisma");

const cache = require("../../middleware/cache");

const { getCache, setCache } = require("../../functions/cache/handleCache");

assetRouter.get("/featured", async (req, res) => {
  let type = req.query.type || "props";

  let page = req.query.page || 1;
  page = parseInt(page);

  page = page < 1 ? 1 : page;

  let limit = req.query.limit || 20;

  let offset = (page - 1) * limit;

  let assets = await getCache(`featured-${type}-${page}-${limit}`);

  if (!assets) {
    assets = await prisma.assets.findMany({
      where: {
        featured: true,
        type: type,
      },
      take: limit,
      skip: offset,
    });
    await setCache(`featured-${type}-${page}-${limit}`, JSON.stringify(assets));
  } else {
    assets = JSON.parse(assets);
  }

  let totalAssets = await getCache(`featured-${type}-total`);

  if (!totalAssets) {
    console.log("total assets not cached");
    totalAssets = await prisma.assets.count({
      where: {
        featured: true,
        type: type,
      },
    });

    await setCache(`featured-${type}-total`, totalAssets);
  }

  let totalPage = Math.ceil(totalAssets / limit);

  res.send({
    assets: assets,
    totalPage: totalPage,
    nextPage: page + 1 > totalPage ? null : page + 1,
  });
});

assetRouter.get("/", async (req, res) => {
  const { author, type } = req.query;

  let page = req.query.page || 1;
  page = parseInt(page);

  page = page < 1 ? 1 : page;

  let limit = req.query.limit || 50;

  let offset = (page - 1) * limit;

  if (!type) {
    res.status(400).send({
      message: "Type is required",
    });
  }

  if (author) {
    let assets = await getCache(`assets-${author}-${type}-${page}-${limit}`);

    if (!assets) {
      assets = await prisma.assets.findMany({
        where: {
          author: author,
          type: type,
        },
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: "desc",
        },
      });

      await setCache(
        `assets-${author}-${type}-${page}-${limit}`,
        JSON.stringify(assets)
      );
    } else {
      assets = JSON.parse(assets);
    }

    let totalAssets = await getCache(`assets-${author}-${type}-total`);

    if (!totalAssets) {
      totalAssets = await prisma.assets.count({
        where: {
          author: author,
          type: type,
        },
      });
    }

    let totalPage = Math.ceil(totalAssets / limit);

    res.send({
      assets: assets,
      totalPage: totalPage,
      nextPage: page + 1 > totalPage ? null : page + 1,
    });
    return;
  } else {
    let assets = await getCache(`assets-${type}-${page}-${limit}`);

    if (!assets) {
      assets = await prisma.assets.findMany({
        where: {
          type: type,
        },
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: "desc",
        },
      });

      await setCache(`assets-${type}-${page}-${limit}`, JSON.stringify(assets));
    } else {
      assets = JSON.parse(assets);
    }

    let totalAssets = await getCache(`assets-${type}-total`);

    if (!totalAssets) {
      totalAssets = await prisma.assets.count({
        where: {
          type: type,
        },
      });
    }

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
