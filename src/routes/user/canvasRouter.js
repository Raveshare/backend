const canvasRouter = require("express").Router();

const prisma = require("../../prisma");

const uploadToLens = require("../../functions/uploadToLens");
const uploadToSolana = require("../../functions/uploadToSolana");
const updateImagePreview = require("../../functions/updateImagePreview");
const updateCollectsForPublication = require("../../functions/updateCollectsForPublication");
const updateNFTOwnerForPublication = require("../../functions/updateNFTOwnerForPublication");

const _ = require("lodash");

const canvasCreated = require("../../functions/events/canvasCreated.event");
const canvasPostedToLens = require("../../functions/events/canvasPostedToLens.event");
const canvasMadePublic = require("../../functions/events/canvasMadePublic.event");

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

    // TODO: uncache

    deleteCacheMatchPattern(`canvases_${user_id}`);
    deleteCache(`canvases_count_${user_id}`);

    res.status(200).send({
      status: "success",
      message: "Canvas Created",
      id: canvas.id,
    });
    // We are already using user_id here for canvasCreated
    canvasCreated(canvas.id, user_id);
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
    try {
      canvas = await prisma.canvases.update({
        where: {
          id: canvasData.id,
          ownerId: user_id,
        },
        data: {
          data: canvasData.data,
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

    deleteCacheMatchPattern(`canvases_${user_id}`);
    deleteCache(`canvas_${canvas.id}`);
    deleteCache(`canvases_count_${user_id}`);

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
  
  // Changed to user_id here from req.user.address
  canvasMadePublic(canvasId, user_id);

  // TODO: uncache

  deleteCacheMatchPattern(`canvases_${user_id}`);

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
      setCache(`canvas_${canvasId}`, JSON.stringify(canvas));
    }
  } else {
    canvas = JSON.parse(publicCanvasCache);
  }

  let owner = await prisma.owners.findUnique({
    where: {
      id: user_id,
    },
  });

  if (canvas.ownerId != user_id) {
    res.status(401).send("Unauthorized");
    return;
  }

  let url = canvas.ipfsLink;

  let resp;
  if (platform == "lens") {
    let postMetadata = {
      name: name,
      content: content,
      handle: owner.lens_handle,
      image: url,
    };

    let referredFrom = canvas.referredFrom;

    resp = await uploadToLens(postMetadata, owner, canvasParams, referredFrom);
    if (resp.status == "error") {
      res.status(500).send({
        message: resp.message,
      });
      return;
    }

    // Already using user_id here
    canvasPostedToLens(canvasId, user_id);
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
  }

  res.send(resp);
});

canvasRouter.delete("/delete/:id", async (req, res) => {
  let canvasId = req.params.id;
  let user_id = req.user.user_id;

  canvasId = parseInt(canvasId);

  let canvas;

  // TODO: do with cache
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
    res.status(401).send("Unauthorized");
    return;
  }

  await prisma.canvases.delete({
    where: {
      id: canvasId,
    },
  });

  await deleteCache(`canvas_${canvasId}`);
  await deleteCacheMatchPattern(`canvases_${user_id}`);

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

  let gateCanvasCache = await getCache(`gateCanvasCache_${canvasId}`);
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
      setCache(`gateCanvasCache_${canvasId}`, JSON.stringify(canvas));
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
      gatedWith: canvas.gatedWith ? [...canvas.gatedWith, gatewith] : [gatewith],
    },
  });

  res.send({
    message: "Canvas Gated Successfully",
  });
});

module.exports = canvasRouter;
