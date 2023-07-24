const utilRouter = require("express").Router();
const uploadImageToS3 = require("../../functions/uploadImageToS3");
const checkDispatcher = require("../../lens/api").checkDispatcher;
const ownerSchema = require("../../schema/ownerSchema");
const { removeBackgroundFromImageUrl } = require("remove.bg");
const getIsWhitelisted = require("../../functions/getIsWhitelisted");
const auth = require("../../middleware/auth/auth");

utilRouter.get("/", async (req, res) => {
  res.send("Util Router");
});

utilRouter.post("/remove-bg", auth, async (req, res) => {
  let { image } = req.query;

  if (!image) return res.send({ error: "No image provided" });

  try {
    removebg = await removeBackgroundFromImageUrl({
      apiKey: process.env.REMOVE_BG_API_KEY,
      url: image,
    });

    let imageBuffer = Buffer.from(removebg.base64img, "base64");

    let result = await uploadImageToS3(imageBuffer, `temp/${Date.now()}.png`);

    res.send({
      s3link: result,
    });
    return;
  } catch (err) {
    console.log(err);
    return res.send({ error: "Error uploading image" });
  }
});

utilRouter.get("/check-dispatcher", auth, async (req, res) => {
  let ownerAddress = req.user.address;

  let owner = await ownerSchema.findOne({
    where: {
      address: ownerAddress,
    },
  });

  let profileId = owner.profileId;

  if (!profileId)
    return res.send({
      status: "error",
      message: "No profileId found",
    });

  const result = await checkDispatcher(profileId);

  res.send({
    status: "success",
    message: result,
    profileId: profileId,
  });
});

utilRouter.get("/whitelisted", async (req, res) => {
  const { wallet } = req.query;

  let isWhitelisted = await getIsWhitelisted(wallet);

  res.send({
    status: "success",
    message: isWhitelisted,
  });
});

module.exports = utilRouter;
