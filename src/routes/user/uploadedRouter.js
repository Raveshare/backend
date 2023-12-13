const uploadedRouter = require("express").Router();
const prisma = require("../../prisma");
const uploadImageToS3 = require("../../functions/image/uploadImageToS3");

uploadedRouter.post("/", async (req, res) => {
  let user_id = req.user.user_id;
  let { image } = req.body;

  if (!image) return res.status(404).send({ error: "No image provided" });

  try {
    let imageBuffer = Buffer.from(image, "base64");

    let result = await uploadImageToS3(
      imageBuffer,
      `user/${user_id}/user_assets/${Date.now()}.png`
    );

    await prisma.uploadeds.create({
      data: {
        ownerId: user_id,
        image: result,
      },
    });

    res.send({
      s3link: result,
    });
    return;
  } catch (err) {
    console.log(err);
    return res.status(503).send({ error: "Error uploading image" });
  }
});

uploadedRouter.get("/", async (req, res) => {
  let evm_address = req.user.evm_address;
  let user_id = req.user.user_id;

  let page = req.query.page || 1;

  let limit = 50;
  let offset = (page - 1) * limit;

  let uploaded, count;
  if (!user_id) {
    uploaded = await prisma.uploadeds.findMany({
      where: {
        address: evm_address,
      },
      skip: offset,
      take: limit,
    });

    count = await prisma.uploadeds.count({
      where: {
        address: evm_address,
      },
    });
  } else {
    uploaded = await prisma.uploadeds.findMany({
      where: {
        ownerId: user_id,
      },
      skip: offset,
      take: limit,
    });

    count = await prisma.uploadeds.count({
      where: {
        ownerId: user_id,
      },
    });
  }

  let pages = Math.ceil(count / limit);

  res.send({
    assets: uploaded,
    totalPage: page,
    nextPage: page + 1 > pages ? null : page + 1,
  });
});

uploadedRouter.delete("/:id", async (req, res) => {
  let user_id = req.user.user_id;
  let evm_address = req.user.evm_address;
  let id = req.params.id;

  if (!id) {
    res.status(400).send({
      status: "error",
      message: "Invalid Request Parameters",
    });
    return;
  }

  await prisma.uploadeds
    .delete({
      where: {
        id: parseInt(id),
        // address: evm_address,
        ownerId: user_id,
      },
    })
    .catch((err) => {
      console.log(err);
      res.status(400).send({
        status: "error",
        message: "Invalid Request Parameters",
      });
      return;
    });

  res.status(200).send({
    message: "Deleted Successfully",
  });
});

module.exports = uploadedRouter;
