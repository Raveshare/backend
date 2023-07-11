const utilRouter = require("express").Router();
const uploadImageToS3 = require("../../functions/uploadImageToS3");
const checkDispatcher = require("../../lens/api").checkDispatcher;
const axios = require("axios");

utilRouter.get("/", async (req, res) => {
  res.send("Util Router");
});

utilRouter.post("/upload-image", async (req, res) => {
  let { image } = req.query;

  if (!image) return res.send({ error: "No image provided" });

  try {
    image = await axios.get(image, { responseType: "arraybuffer" });

    image = Buffer.from(image.data, "binary");
  } catch (err) {
    console.log(err);
    return res.send({ error: "Error fetching image" });
  }

  try {
    let result = await uploadImageToS3(image, `test/${Date.now()}.png`);
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
