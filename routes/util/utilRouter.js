const utilRouter = require("express").Router();
const uploadImageToS3 = require("../../functions/uploadImageToS3");
const checkDispatcher = require("../../lens/api").checkDispatcher;
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

utilRouter.get("/check-dispatcher", async (req, res) => {
  const { profileId } = req.query;

  console.log("profileId", profileId);

  const result = await checkDispatcher(profileId);

  res.send(result);
});

module.exports = utilRouter;
