const uploadedRouter = require("express").Router();
const uploadedSchema = require("../../schema/uploaded.schema");
const uploadImageToS3 = require("../../functions/uploadImageToS3");

uploadedRouter.post("/", async (req, res) => {
  let address = req.user.address;
  let { image } = req.body;

  if (!image) return res.status(404).send({ error: "No image provided" });

  try {
    let imageBuffer = Buffer.from(image, "base64");

    let result = await uploadImageToS3(
      imageBuffer,
      `user/${address}/user_assets/${Date.now()}.png`
    );

    await uploadedSchema.create({
      address: address,
      image: result,
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
  let address = req.user.address;

  let page = req.query.page || 1;

  let limit = 50;
  let offset = (page - 1) * limit;

  let uploaded = await uploadedSchema.findAll({
    where: {
      address: address,
    },
    limit: limit,
    offset: offset,
  });

  let count = await uploadedSchema.count({
    where: {
        address: address,
    }
    });

    let pages = Math.ceil(count / limit);

  res.send({
    assets  : uploaded,
    totalPage : page,
    nextPage : page + 1 > pages ? null : page + 1,
  });
});

uploadedRouter.delete("/:id", async (req, res) => {
  let address = req.user.address;
  let id = req.params.id;

  if (!id) {
    res.status(400).send({
      status: "error",
      message: "Invalid Request Parameters",
    });
    return;
  }

  let uploadedData = await uploadedSchema.findOne({
    where: {
      id: id,
      address: address,
    },
  });

  if (!uploadedData) {
    res.status(400).send({
      status: "error",
      message: "Invalid Request Parameters",
    });
    return;
  }

  await uploadedData.destroy();

  res.status(200).send({
    message : "Deleted Successfully",
  });
});

module.exports = uploadedRouter;
