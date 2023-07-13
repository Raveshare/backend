const utilRouter = require("express").Router();
const uploadImageToS3 = require("../../functions/uploadImageToS3");
const checkDispatcher = require("../../lens/api").checkDispatcher;
const axios = require("axios");
const { removeBackgroundFromImageUrl } = require("remove.bg");

utilRouter.get("/", async (req, res) => {
  res.send("Util Router");
});

utilRouter.post("/remove-bg", async (req, res) => {
  let { image } = req.query;

  if (!image) return res.send({ error: "No image provided" });

  try {
    // image = await axios.get(image, { responseType: "arraybuffer" });

    console.log(image);

    removebg = await removeBackgroundFromImageUrl({
      apiKey: process.env.REMOVE_BG_API_KEY,
      url: image,
    });

    console.log(removebg);

    let result = await uploadImageToS3(removebg.base64img, `${Date.now()}.png`);

    res.send({
      s3link: result,
    });
    return;
  } catch (err) {
    console.log(err);
    return res.send({ error: "Error uploading image" });
  }
});

utilRouter.get("/check-dispatcher", async (req, res) => {
  const { profileId } = req.query;

  console.log("profileId", profileId);

  const result = await checkDispatcher(profileId);

  res.send(result);
});

module.exports = utilRouter;
