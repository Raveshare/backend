const canvasRouter = require("express").Router();

const prisma = require("../../prisma");

const uploadToLens = require("../../functions/uploadToLens");
const uploadToTwitter = require("../../functions/uploadToTwitter");
const uploadToSolana = require("../../functions/uploadToSolana");
const updateImagePreview = require("../../functions/updateImagePreview");
const updateCollectsForPublication = require("../../functions/updateCollectsForPublication");
const updateNFTOwnerForPublication = require("../../functions/updateNFTOwnerForPublication");

const _ = require("lodash");

const canvasCreated = require("../../functions/events/canvasCreated.event");
const canvasPostedToTwitter = require("../../functions/events/canvasPostedToTwitter.event");
const canvasPostedToLens = require("../../functions/events/canvasPostedToLens.event");
const canvasMadePublic = require("../../functions/events/canvasMadePublic.event");

const sendError = require("../../functions/webhook/sendError.webhook");

canvasRouter.get("/", async (req, res) => {
  let user_id = req.user.user_id;

  let page = req.query.page || 1;
  page = parseInt(page);

  page = page < 1 ? 1 : page;

  let limit = req.query.limit || 10;

  let offset = (page - 1) * limit;

  let canvasData = await prisma.canvases.findMany({
    where: {
      ownerId: user_id,
    },
    take: limit,
    skip: offset,
    orderBy: {
      updatedAt: "desc",
    },
  });

  let totalAssets = await prisma.canvases.count({
    where: {
      ownerId: user_id,
    },
  });

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
    canvasData.referredFrom = canvasData.referredFrom?.map((ref) => {
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

    res.status(200).send({
      status: "success",
      message: "Canvas Created",
      id: canvas.id,
    });

    canvasCreated(canvas.id, user_id);
  } catch (error) {
    console.log(error);
    res.status(500).send(`Error: ${error}`);
    sendError(`${error} - ${address} - /create`);
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
    canvasData.referredFrom = canvasData.referredFrom?.map((ref) => {
      if (ref) return ref;
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

    res.status(200).send({
      status: "success",
      message: "Canvas Updated",
    });
  } catch (error) {
    // console.log(error);
    res.status(500).send({
      status: "error",
      message: `Error: ${error}`,
    });
    sendError(`${error} - ${ownerAddress} - /update`);
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

  // let canvas = await canvasSchema.findOne({
  //   where: {
  //     id: canvasId,
  //   },
  // });

  let canvas = await prisma.canvases.findUnique({
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

  canvasMadePublic(canvasId, req.user.address);

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

  let canvas = await prisma.canvases.findUnique({
    where: {
      id: canvasId,
    },
  });

  if (!canvas) {
    res.status(404).send("Canvas not found");
    return;
  }

  let owner = await prisma.owners.findUnique({
    where: {
      id: user_id,
    },
  });

  // console.log(canvas.ownerId);
  // console.log(user_id);
  // if (canvas.ownerId != user_id) {
  //   res.status(401).send("Unauthorized");
  //   return;
  // }

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
    canvasPostedToLens(canvasId, user_id);
  } else if (platform == "twitter") {
    resp = await uploadToTwitter(postMetadata, owner);
    canvasPostedToTwitter(canvasId, ownerAddress);
  } else if (platform == "solana") {
    let postMetadata = {
      name: name,
      content: content,
      image: url,
    };

    resp = await uploadToSolana(postMetadata, owner, canvasParams);

    if(resp.status == 500){
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

  let canvas = await prisma.canvases.findUnique({
    where: {
      id: canvasId,
    },
  });

  if (canvas.ownerId != user_id) {
    res.status(401).send("Unauthorized");
    return;
  }

  await prisma.canvases.delete({
    where: {
      id: canvasId,
    },
  });

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

  let canvas = await prisma.canvases.findUnique({
    where: {
      id: canvasId,
    },
  });

  if (!canvas) {
    res.status(404).send({
      message: "Canvas Not Found",
    });
    return;
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
    updateCollectsForPublication(gatewith, canvasId);
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
    },
  });

  res.send({
    message: "Canvas Gated Successfully",
  });
});

module.exports = canvasRouter;
