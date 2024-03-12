const canvasRouter = require("express").Router();

const prisma = require("../../prisma");
const { v4: uuidv4 } = require("uuid");

const uploadToLens = require("../../functions/share/uploadToLens");
const uploadToSolana = require("../../functions/share/uploadToSolana");
const uploadToFarcaster = require("../../functions/share/uploadToFarcaster");
const updateImagePreview = require("../../functions/image/updateImagePreview");
const updateNFTOwnerForPublication = require("../../functions/updateNFTOwnerForPublication");

const _ = require("lodash");

// events for canvas
const canvasCreated = require("../../functions/events/canvasCreated.event");
const canvasPostedToLens = require("../../functions/events/canvasPostedToLens.event");
const canvasMadePublic = require("../../functions/events/canvasMadePublic.event");
const canvasPostedToFarcaster = require("../../functions/events/canvasPostedToFarcaster.event");
const canvasPosted = require("../../functions/events/canvasPosted.event");
const canvasMintedToXChain = require("../../functions/events/canvasMintedToXChain.event");

const canvasShared = require("../../functions/events/canvasShared.event");
const canvasSharedClicked = require("../../functions/events/canvasSharedClicked.event");

const sendError = require("../../functions/webhook/sendError.webhook");

const {
  getCache,
  setCache,
  deleteCacheMatchPattern,
  deleteCache,
} = require("../../functions/cache/handleCache");

canvasRouter.get("/", async (req, res) => {
  let user_id = req.user.user_id;

  let page = req.query.page || 1;
  page = parseInt(page);

  page = page < 1 ? 1 : page;

  let limit = req.query.limit || 10;

  let offset = (page - 1) * limit;

  let canvasData;
  let canvasCache = await getCache(`canvases_${user_id}_${page}_${limit}`);
  if (!canvasCache) {
    canvasData = await prisma.canvases.findMany({
      where: {
        ownerId: user_id,
      },
      take: limit,
      skip: offset,
      orderBy: {
        updatedAt: "desc",
      },
    });

    await setCache(
      `canvases_${user_id}_${page}_${limit}`,
      JSON.stringify(canvasData)
    );
  } else {
    canvasData = JSON.parse(canvasCache);
  }

  let totalAssets;

  let totalAssetsCache = await getCache(`canvases_count_${user_id}`);
  if (!totalAssetsCache) {
    totalAssets = await prisma.canvases.count({
      where: {
        ownerId: user_id,
      },
    });

    await setCache(`canvases_count_${user_id}`, JSON.stringify(totalAssets));
  } else {
    totalAssets = JSON.parse(totalAssetsCache);
  }

  let totalPages = Math.ceil(totalAssets / limit);

  res.send({
    assets: canvasData,
    totalPages,
    nextPage: page + 1 > totalPages ? null : page + 1,
  });
});

canvasRouter.get("/searchPublic", async (req, res) => {
  try {
    let searchString = req.query.tag;
    const tagCache = await getCache(`tags_public_${searchString}`);
    let canvasesMatchingTags;
    if (!tagCache) {
      canvasesMatchingTags = await prisma.canvases.findMany({
        where: {
          isPublic: true,
          tags: {
            hasSome: [searchString],
          },
        },
      });

      await setCache(
        `tags_public_${searchString}`,
        JSON.stringify(canvasesMatchingTags)
      );
    } else {
      canvasesMatchingTags = JSON.parse(tagCache);
    }
    res.send({
      assets: canvasesMatchingTags,
    });
  } catch (error) {
    res.send(error.message);
  }
});

canvasRouter.get("/search", async (req, res) => {
  try {
    let ownerId = req.user.user_id;
    let searchString = req.query.tag;
    // console.log(ownerId, searchString);
    const tagCache = await getCache(`tags_${ownerId}_${searchString}`);
    let canvasesMatchingTags;
    if (!tagCache) {
      canvasesMatchingTags = await prisma.canvases.findMany({
        where: {
          ownerId,
          tags: {
            hasSome: [searchString],
          },
        },
      });

      await setCache(
        `tags_${ownerId}_${searchString}`,
        JSON.stringify(canvasesMatchingTags)
      );
    } else {
      canvasesMatchingTags = JSON.parse(tagCache);
    }
    res.send({
      assets: canvasesMatchingTags,
    });
  } catch (error) {
    console.log(error);
    res.send(error.message);
  }
});

canvasRouter.post("/create", async (req, res) => {
  let user_id = req.user.user_id;
  let canvasData = req.body.canvasData;
  let preview = req.body.preview;

  if (!canvasData) {
    res.status(400).send({
      status: "error",
      message: "Invalid Request Parameters",
    });
    return;
  }

  try {
    canvasData.referredFrom = canvasData.referredFrom?.filter((ref) => {
      if (ref) return String(ref);
    });

    canvas = await prisma.canvases.create({
      data: {
        ...canvasData,
        ownerId: user_id,
      },
    });

    try {
      updateImagePreview(preview, user_id, canvas.id);
    } catch (error) {
      console.log(error);
      res.status(500).send(`Error: ${error}`);
      return;
    }

    await deleteCacheMatchPattern(`canvases_${user_id}`);
    await deleteCache(`canvases_count_${user_id}`);

    res.status(200).send({
      status: "success",
      message: "Canvas Created",
      id: canvas.id,
    });

    await canvasCreated(canvas.id, user_id);
  } catch (error) {
    res.status(500).send(`Error: ${error}`);
    sendError(`${error} - ${user_id} - /create`);
    return;
  }
});

canvasRouter.put("/update", async (req, res) => {
  let canvasData = req.body.canvasData;
  let user_id = req.user.user_id;
  let preview = req.body.preview;

  if (!canvasData.id) {
    res.status(400).send({
      status: "error",
      message: "Invalid Request Parameters",
    });
    return;
  }

  try {
    canvasData.referredFrom = canvasData.referredFrom?.filter((ref) => {
      if (ref) return String(ref);
    });

    let canvas;

    console.log(canvasData.tags);
    try {
      canvas = await prisma.canvases.update({
        where: {
          id: canvasData.id,
          ownerId: user_id,
        },
        data: {
          data: canvasData.data,
          tags: canvasData.tags,
          referredFrom: canvasData.referredFrom,
          assetsRecipientElementData: canvasData.assetsRecipientElementData,
        },
      });
    } catch (error) {
      res.status(500).send({
        message: "Record not found",
      });
      return;
    }

    updateImagePreview(preview, user_id, canvas.id);

    await deleteCacheMatchPattern(`canvases_${user_id}`);
    await deleteCache(`canvas_${canvas.id}`);
    await deleteCache(`canvases_count_${user_id}`);
    await deleteCacheMatchPattern(`public_templates`);

    res.status(200).send({
      status: "success",
      message: "Canvas Updated",
    });
  } catch (error) {
    res.status(500).send({
      status: "error",
      message: `Error: ${error}`,
    });
    sendError(`${error} - ${user_id} - /update`);
    return;
  }
});

canvasRouter.put("/visibility", async (req, res) => {
  let user_id = req.user.user_id;

  let canvasData = req.body.canvasData;

  if (!canvasData.id) {
    res.status(400).send({
      status: "error",
      message: "Invalid Request Parameters",
    });
    return;
  }

  let canvasId = canvasData.id;
  let isPublic = canvasData.isPublic;

  let canvas;
  const visibilityCanvasCache = await getCache(`canvas_${canvasId}`);

  if (!visibilityCanvasCache) {
    canvas = await prisma.canvases.findUnique({
      where: {
        id: canvasId,
      },
    });

    if (!canvas) {
      res.status(404).send({
        status: "error",
        message: "Canvas Not Found",
      });
      return;
    } else {
      await setCache(`canvas_${canvasId}`, JSON.stringify(canvas));
    }
  } else {
    canvas = JSON.parse(visibilityCanvasCache);
  }

  console.log(user_id);

  if (canvas.ownerId != user_id) {
    res.status(403).send({
      status: "error",
      message: "Forbidden",
    });
    return;
  }

  await prisma.canvases.update({
    where: {
      id: canvasId,
    },
    data: {
      isPublic: isPublic,
    },
  });

  await canvasMadePublic(canvasId, user_id);
  await deleteCacheMatchPattern(`canvases_${user_id}`);
  await deleteCacheMatchPattern(`public_templates`);

  let msg = `Canvas ${canvasId} made ${isPublic ? "public" : "private"}`;

  res.status(200).send({
    status: "success",
    message: msg,
  });
});

canvasRouter.post("/publish", async (req, res) => {
  let canvasData = req.body.canvasData;
  let user_id = req.user.user_id;
  let platform = req.body.platform;
  let canvasParams = req.body.canvasParams;

  let canvasId, name, content;

  try {
    canvasId = canvasData.id;
    name = canvasData.name;
    content = canvasData.content;
  } catch (error) {
    console.log(error);
    res.status(500).send(`Error: ${error}`);
    return;
  }

  if (!platform) {
    res.status(400).send("Platform not specified");
    return;
  }

  let canvas;
  let publicCanvasCache = await getCache(`canvas_${canvasId}`);
  if (!publicCanvasCache) {
    canvas = await prisma.canvases.findUnique({
      where: {
        id: canvasId,
      },
    });

    if (!canvas) {
      res.status(404).send("Canvas not found");
      return;
    } else {
      await setCache(`canvas_${canvasId}`, JSON.stringify(canvas));
    }
  } else {
    canvas = JSON.parse(publicCanvasCache);
  }
  let ownerCache = await getCache(`user_${user_id}`);
  let owner;
  if (!ownerCache) {
    owner = await prisma.owners.findUnique({
      where: {
        id: user_id,
      },
    });
    await setCache(`user_${user_id}`, JSON.stringify(owner));
  } else {
    owner = JSON.parse(ownerCache);
  }

  if (canvas.ownerId != user_id) {
    return res.status(401).send({
      message: "Unauthorized",
    });
  }

  let url = canvas.ipfsLink;

  let resp;
  if (platform == "lens") {
    let postMetadata = {
      name: name,
      content: content,
      handle: owner.lens_handle,
      id: owner.id,
      image: url,
      xChain: canvasParams?.xChain,
    };

    let referredFrom = canvas.referredFrom;

    resp = await uploadToLens(postMetadata, owner, canvasParams, referredFrom);
    if (resp.status == "error") {
      res.status(500).send({
        message: resp.message,
      });
      return;
    }

    await canvasPostedToLens(canvasId, user_id);
  } else if (platform == "solana-cnft") {
    let postMetadata = {
      name: name,
      content: content,
      image: url,
    };

    resp = await uploadToSolana(postMetadata, owner, canvasParams, "cnft");

    if (resp.status == 500) {
      res.status(500).send({
        message: resp.error,
      });
      return;
    }
  } else if (platform == "solana-master") {
    let postMetadata = {
      name: name,
      content: content,
      image: url,
    };

    resp = await uploadToSolana(postMetadata, owner, canvasParams, "master");

    if (resp.status == 500) {
      res.status(500).send({
        message: resp.error,
      });
      return;
    }
  } else if (platform == "farcaster") {
    let zoraMintLink = canvasParams?.zoraMintLink;
    let frameLink = canvasParams?.frameLink;
    let channelId = canvasParams?.channelId;
    let postMetadata = {
      name: name,
      content: content,
      image: zoraMintLink
        ? [zoraMintLink]
        : frameLink
        ? [frameLink]
        : canvas.imageLink,
      channelId: channelId,
      canvasId: canvasId,
      xChain: canvasParams?.xChain,
    };

    resp = await uploadToFarcaster(postMetadata, owner);
    await canvasPostedToFarcaster(canvasId, user_id);

    if (resp.status == 500) {
      res.status(500).send({
        message: resp.error,
      });
      return;
    }
  }

  res.send(resp);
});

canvasRouter.delete("/delete/:id", async (req, res) => {
  let canvasId = req.params.id;
  let user_id = req.user.user_id;

  canvasId = parseInt(canvasId);

  let canvas;

  let canvasCache = await getCache(`canvas_${canvasId}`);
  if (!canvasCache) {
    canvas = await prisma.canvases.findUnique({
      where: {
        id: canvasId,
      },
    });
    await setCache(`canvas_${canvasId}`, JSON.stringify(canvas));
  } else {
    canvas = JSON.parse(canvasCache);
  }

  if (canvas?.ownerId != user_id) {
    res.status(401).send({
      message: "Unauthorized",
    });
    return;
  }

  await prisma.canvases.delete({
    where: {
      id: canvasId,
    },
  });

  await deleteCache(`canvas_${canvasId}`);
  await deleteCacheMatchPattern(`canvases_${user_id}`);
  await deleteCacheMatchPattern(`public_templates`);

  res.status(200).send({
    status: "success",
    message: "Canvas Deleted",
  });
});

canvasRouter.post("/gate/:id", async (req, res) => {
  let user_id = req.user.user_id;

  let canvasId = req.params.id;

  canvasId = parseInt(canvasId);

  let gatewith = req.body.gatewith;

  if (!canvasId || !gatewith) {
    res.status(400).send({
      message: "Invalid Request Parameters",
    });
    return;
  }

  let canvas;
  // Canvas is cached based on canvasId
  let gateCanvasCache = await getCache(`canvas_${canvasId}`);
  if (!gateCanvasCache) {
    canvas = await prisma.canvases.findUnique({
      where: {
        id: canvasId,
      },
    });
    if (!canvas) {
      res.status(404).send({
        message: "Canvas Not Found",
      });
      return;
    } else {
      await setCache(`canvas_${canvasId}`, JSON.stringify(canvas));
    }
  } else {
    canvas = JSON.parse(gateCanvasCache);
  }

  if (canvas.ownerId != user_id) {
    res.status(403).send({
      message: "Forbidden",
    });
    return;
  }

  if (gatewith.startsWith("https://")) {
    gatewith = gatewith.split("/");
    gatewith = gatewith[gatewith.length - 1];
  } else if (gatewith.startsWith("0x")) {
    updateNFTOwnerForPublication(gatewith, canvasId);
  } else {
    res.status(400).send({
      message: "Invalid Request Parameters",
    });
    return;
  }

  await prisma.canvases.update({
    where: {
      id: canvasId,
    },
    data: {
      isGated: true,
      gatedWith: canvas.gatedWith
        ? [...canvas.gatedWith, gatewith]
        : [gatewith],
    },
  });

  await deleteCacheMatchPattern(`canvases_${user_id}`);
  await deleteCacheMatchPattern(`public_templates`);

  res.send({
    message: "Canvas Gated Successfully",
  });
});

canvasRouter.post("/minted", async (req, res) => {
  let canvasId = req.body.canvasId;
  let mintLink = req.body.mintLink;
  let platform = req.body.platform;
  let xChain = req.body.chain;
  let userId = req.user.user_id;

  let contractType = req.body.contractType;
  let chainId = req.body.chainId;
  let hash = req.body.hash;

  await canvasPosted(
    canvasId,
    userId,
    platform,
    xChain,
    new Date(Date.now()),
    mintLink
  );
  canvasMintedToXChain(canvasId, userId, platform, xChain);

  const uuid = uuidv4();

  let slug = "lp-canvas" + "-" + canvasId + "-" + uuid.split("-")[0];

  let contract = mintLink.split(":")
  contract = contract[contract.length - 1]

  console.log({
    canvasId,
    chainId,
    contractType,
    slug,
    contract,
    hash,
  })


  await prisma.shared_mint_canvas.create({
    data : {
      canvasId,
      chainId,
      contractType,
      slug,
      contract,
      hash,
    }
  })

  res.send({
    slug : slug,
    contract,
    chainId,
  });
});

canvasRouter.post("/generate-share-slug", async (req, res) => {
  let user_id = req.user.user_id;
  user_id = parseInt(user_id);
  let { canvasId } = req.query;
  canvasId = parseInt(canvasId);

  if (!canvasId) {
    res.send({
      message: "field `canvasId` is missing",
    });
    return;
  }

  let canvas = await prisma.canvases.findUnique({
    where: {
      id: canvasId,
    },
    select: {
      ownerId: true,
    },
  });

  if (canvas?.ownerId != user_id) {
    res.status(403).send({
      message: "Forbidden",
    });
    return;
  }

  const uuid = uuidv4();

  let slug = "lp-canvas" + "-" + canvasId + "-" + uuid.split("-")[0];

  await prisma.shared_canvas.create({
    data: {
      canvasId: canvasId,
      slug: slug,
    },
  });

  canvasShared(canvasId, user_id);

  res.send({
    message: slug,
  });
});

canvasRouter.get("/get-shared-canvas", async (req, res) => {
  let slug = req.query.slug;
  let user_id = req.user.user_id;

  let sharedCanvas = await prisma.shared_canvas.findUnique({
    where: {
      slug: slug,
    },
  });

  if (!sharedCanvas) {
    res.status(404).send({
      message: "Canvas Not Found",
    });
    return;
  }

  let canvas = await prisma.canvases.findUnique({
    where: {
      id: sharedCanvas.canvasId,
    },
    select: {
      data: true,
      imageLink: true,
    },
  });

  canvasSharedClicked(sharedCanvas.canvasId, user_id);

  res.send({
    data: canvas?.data || {},
    image: canvas?.imageLink[0] || "",
  });
});

module.exports = canvasRouter;
