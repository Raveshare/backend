const collectionRouter = require("express").Router();
const prisma = require("../../prisma");

const { getCache, setCache } = require("../../functions/cache/handleCache");

collectionRouter.get("/:collection/", async (req, res) => {
  let collectionAddress = req.params.collection;

  let page = req.query.page || 1;
  page = parseInt(page);

  page = page < 1 ? 1 : page;

  let limit = req.query.limit || 50;

  let offset = limit * (page - 1);
  // this query can be cached again, as the collections are not changing frequently - so we can remove the cache middleware and cache till the asset are not updated

  let collectionsCache = await getCache(
    `collections_insensitive_${collectionAddress}`
  );
  let collections;

  if (!collectionsCache) {
    collections = await prisma.collections.findFirst({
      where: {
        address: {
          equals: collectionAddress,
          mode: "insensitive",
        },
      },
    });
    await setCache(
      `collections_insensitive_${collectionAddress}`,
      JSON.stringify(collections)
    );
  } else {
    collections = JSON.parse(collectionsCache);
  }

  // We can cache the contents too as they are not changing frequently
  let contentsCache = await getCache(`collectionContent_${collections.id}_${page}_${limit}`);
  let contents;

  if (!contentsCache ) {

    contents = await prisma.contents.findMany({
      where: {
        collectionId: collections.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: limit,
    });
    await setCache(
      `collectionContent_${collections.id}_${page}_${limit}`,
      JSON.stringify(contents)
    );
  } else {
    contents = JSON.parse(contentsCache);
  }

  let totalAssets = await prisma.contents.count({
    where: {
      collectionId: collections.id,
    },
  });

  let totalPage = Math.ceil(totalAssets / limit);

  res.send({
    assets: contents,
    totalPage: totalPage,
    nextPage: page >= totalPage ? null : page + 1,
  });
});

collectionRouter.get("/:collection/:id", async (req, res) => {
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
      address: {
        equals: collectionAddress,
        mode: "insensitive",
      },
    },
  });

  let contents = await prisma.contents.findFirst({
    where: {
      AND: [
        {
          id: {
            equals: parseInt(id),
          },
        },
        {
          collectionId: {
            equals: collections.id,
          },
        },
      ],
    },
  });

  res.send({
    assets: contents,
  });
});

collectionRouter.get("/", async (req, res) => {
  let page = req.query.page || 1;
  page = parseInt(page);

  page = page < 1 ? 1 : page;

  let limit = req.query.limit || 20;

  let offset = (page - 1) * limit;

  let collectionsCache = await getCache(`collections-${page}-${limit}`);

  let collections;
  if (!collectionsCache) {
    collections = await prisma.collections.findMany({
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: "desc",
      },
    });
    await setCache(`collections-${page}-${limit}`, JSON.stringify(collections));
  } else {
    collections = JSON.parse(collectionsCache);
  }

  let totalAssets = await prisma.collections.count({});

  let totalPage = Math.ceil(totalAssets / limit);

  res.send({
    assets: collections,
    totalPage: totalPage,
    nextPage: page + 1 > totalPage ? null : page + 1,
  });
});

module.exports = collectionRouter;
