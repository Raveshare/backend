const utilRouter = require("express").Router();
const uploadImageToS3 = require("../../functions/uploadImageToS3");
const axios = require("axios");

utilRouter.get("/", async (req, res) => {
  res.send("Util Router");
});

utilRouter.post("/upload-image", async (req, res) => {
  let { image } = req.query;

  image = await axios.get(image, { responseType: "arraybuffer" });

  image = Buffer.from(image.data, "binary");

  let result = await uploadImageToS3(image, `test/${Date.now()}.png`);

  res.send({
    s3link: result,
  });
});

module.exports = utilRouter;
