const canvasRouter = require("express").Router();

const canvasSchema = require("../../schema/canvasSchema");
const ownerSchema = require("../../schema/ownerSchema");

const uploadToLens = require("../../functions/uploadToLens");
const uploadToTwitter = require("../../functions/uploadToTwitter");
const updateImagePreview = require("../../functions/updateImagePreview");

const _ = require("lodash");

const canvasCreated = require("../../functions/events/canvasCreated.event");
const canvasPostedToTwitter = require("../../functions/events/canvasPostedToTwitter.event");
const canvasPostedToLens = require("../../functions/events/canvasPostedToLens.event");
const canvasMadePublic = require("../../functions/events/canvasMadePublic.event");

const sendError = require("../../functions/webhook/sendError.webhook");

canvasRouter.get("/ping", async (req, res) => {
  res.send("Canvas Router");
});

canvasRouter.get("/", async (req, res) => {
  let limit = req.query.limit || 50;
  let offset = req.query.offset || 0;
  let address = req.user.address;

  let canvasDatas = await canvasSchema.findAll({
    limit: limit,
    offset: offset,
    order: [["createdAt"]],
    where: {
      ownerAddress: address,
    },
  });

  res.send(canvasDatas);
});

canvasRouter.get("/public", async (req, res) => {
  let limit = req.query.limit || 50;
  let offset = req.query.offset || 0;

  let canvasDatas = await canvasSchema.findAll({
    limit: limit,
    offset: offset,
    order: [["createdAt"]],
    where: {
      isPublic: true,
    },
  });

  res.status(200).send({
    status: "success",
    message: "Public Canvases Found",
    canvasDatas: canvasDatas,
  });
});

canvasRouter.get("/:id", async (req, res) => {
  let address = req.user.address;
  let id = req.params.id;

  if (!id) {
    res.status(400).send({
      status: "error",
      message: "Invalid Request Parameters",
    });
    return;
  }

  let canvasData = await canvasSchema.findOne({
    where: {
      id: id,
      isPublic: true,
    },
  });

  // console.log(canvasData);

  if (canvasData) {
    res.status(200).send({
      status: "success",
      message: "Canvas Found",
      canvasData: canvasData,
    });
  }

  let canvas = await canvasSchema.findOne({
    where: {
      id: id,
    },
  });

  if (canvas.ownerAddress != address) {
    res.status(403).send({
      status: "error",
      message: "Forbidden",
    });
    return;
  }

  res.status(200).send({
    status: "success",
    message: "Canvas Found",
    canvasData: canvasData,
  });
});

canvasRouter.post("/create", async (req, res) => {
  let address = req.user.address;
  let canvasData = req.body.canvasData;
  let preview = req.body.preview;

  console.log(canvasData);

  if (!canvasData) {
    res.status(400).send({
      status: "error",
      message: "Invalid Request Parameters",
    });
    return;
  }

  try {
    canvas = await canvasSchema.create(canvasData);

    let owner = await ownerSchema.findOne({
      where: {
        address: address,
      },
    });

    await owner.addCanvas(canvas);

    try {
      updateImagePreview(preview, address, canvas.id);
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

    canvasCreated(canvas.id, address);
  } catch (error) {
    console.log(error);
    res.status(500).send(`Error: ${error}`);
    sendError(`${error} - ${address} - /create`);
    return;
  }
});

canvasRouter.put("/update", async (req, res) => {
  let canvasData = req.body.canvasData;
  let ownerAddress = req.user.address;
  let preview = req.body.preview;

  if (!canvasData.id) {
    res.status(400).send({
      status: "error",
      message: "Invalid Request Parameters",
    });
    return;
  }

  try {
    let canvas = await canvasSchema.findOne({
      where: {
        id: canvasData.id,
      },
    });

    if (!canvas) {
      res.status(404).send({
        status: "error",
        message: "Canvas Not Found",
      });
      return;
    }

    if (canvas.ownerAddress != ownerAddress) {
      res.status(403).send({
        status: "error",
        message: "Forbidden",
      });
      return;
    }

    let isEqual = _.isEqual(canvas.data, canvasData.data);

    if (isEqual) {
      console.log("Canvas is equal");
      res.status(200).send({
        status: "success",
        message: "Canvas Updated",
      });
      return;
    }

    await canvasSchema.update(
      {
        data: canvasData.data,
      },
      {
        where: {
          id: canvasData.id,
        },
      }
    );

    updateImagePreview(preview, ownerAddress, canvas.id);

    res.status(200).send({
      status: "success",
      message: "Canvas Updated",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "error",
      message: `Error: ${error}`,
    });
    sendError(`${error} - ${ownerAddress} - /update`);
    return;
  }
});

// TODO: check if canvas is public

canvasRouter.put("/visibility", async (req, res) => {
  let ownerAddress = req.user.address;

  let canvasData = req.body.canvasData;

  if (!canvasData.id || !canvasData.isPublic) {
    res.status(400).send({
      status: "error",
      message: "Invalid Request Parameters",
    });
    return;
  }

  let canvasId = canvasData.id;
  let isPublic = canvasData.isPublic;

  let canvas = await canvasSchema.findOne({
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

  if (canvas.ownerAddress != ownerAddress) {
    res.status(403).send({
      status: "error",
      message: "Forbidden",
    });
    return;
  }

  await canvasSchema.update(
    {
      isPublic: isPublic,
    },
    {
      where: {
        id: canvasId,
      },
    }
  );

  canvasMadePublic(canvasId, req.user.address);

  let msg = `Canvas ${canvasId} made ${isPublic ? "public" : "private"}`;

  res.status(200).send({
    status: "success",
    message: msg,
  });
});

canvasRouter.post("/publish", async (req, res) => {
  let canvasData = req.body.canvasData;
  let ownerAddress = req.user.address;
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

  let canvas = await canvasSchema.findOne({
    where: {
      id: canvasId,
    },
  });

  if (!canvas) {
    res.status(404).send("Canvas not found");
    return;
  }

  let owner = await ownerSchema.findOne({
    where: {
      address: ownerAddress,
    },
  });

  if (canvas.ownerAddress != ownerAddress) {
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
    canvasPostedToLens(canvasId, ownerAddress);
  } else if (platform == "twitter") {
    resp = await uploadToTwitter(postMetadata, owner);
    canvasPostedToTwitter(canvasId, ownerAddress);
  }

  res.send(resp);
});

canvasRouter.delete("/delete/:id", async (req, res) => {
  let canvasId = req.params.id;
  let ownerAddress = req.user.address;

  let canvas = await canvasSchema.findOne({
    where: {
      id: canvasId,
    },
  });

  if (canvas.ownerAddress != ownerAddress) {
    res.status(401).send("Unauthorized");
    return;
  }

  await canvasSchema.destroy({
    where: {
      id: canvasId,
    },
  });

  res.status(200).send({
    status: "success",
    message: "Canvas Deleted",
  });
});

module.exports = canvasRouter;
