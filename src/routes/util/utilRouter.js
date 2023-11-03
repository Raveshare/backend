const utilRouter = require("express").Router();
const uploadImageToS3 = require("../../functions/helper/uploadImageToS3");
const checkProfileManager  = require("../../lens/api-v2").checkProfileManager;
const { removeBackgroundFromImageUrl } = require("remove.bg");
const getIsWhitelisted = require("../../functions/getIsWhitelisted");
const auth = require("../../middleware/auth/auth");
const prisma = require("../../prisma");

const { getCache, setCacheWithExpire } = require("../../functions/cache/handleCache");

utilRouter.get("/", async (req, res) => {
  res.send("Util Router");
});

utilRouter.post("/remove-bg", auth, async (req, res) => {
  let { image, id } = req.query;

  if (!image) return res.send({ error: "No image provided" });

  try {
    removebg = await removeBackgroundFromImageUrl({
      apiKey: process.env.REMOVE_BG_API_KEY,
      url: image,
    });

    let imageBuffer = Buffer.from(removebg.base64img, "base64");

    let result = await uploadImageToS3(imageBuffer, `temp/${Date.now()}.png`);

    res.send({
      id: id,
      s3link: result,
    });
    return;
  } catch (err) {
    console.log(err);
    return res.send({ error: "Error uploading image" });
  }
});

utilRouter.post("/upload-image", auth, async (req, res) => {
  let address = req.user.address;
  let { image } = req.body;

  if (!image) return res.status(404).send({ error: "No image provided" });

  try {
    let imageBuffer = Buffer.from(image, "base64");

    let result = await uploadImageToS3(
      imageBuffer,
      `user/${address}/user_assets/${Date.now()}.png`
    );

    await prisma.uploadeds.create({
      data: {
        address: address,
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

utilRouter.get("/check-dispatcher", auth, async (req, res) => {
  let user_id = req.user.user_id;

  let ownerCache = await getCache(`user_${user_id}`);
  let owner;
  if (!ownerCache) {
    owner = await prisma.owners.findUnique({
      where: {
        id: user_id,
      },
    });
    await setCache(`user_${user_id}`, JSON.stringify(ownerData));
  } else {
    owner = JSON.parse(ownerCache);
  }

  let profileId = owner.profileId;

  if (!profileId)
    return res.send({
      status: "error",
      message: "No profileId found",
    });

  const result = await checkProfileManager(profileId);

  res.send({
    status: "success",
    message: result,
    profileId: profileId,
  });
});

utilRouter.get("/whitelisted", async (req, res) => {
  const { wallet } = req.query;
  let isWhitelistedCache = await getCache(`isWhitelisted_${wallet}`);
  isWhitelistedCache = isWhitelistedCache === "true" ? true : false;

  if (!isWhitelistedCache) {
    let isWhitelisted = await getIsWhitelisted(wallet);
    res.send({
      status: "success",
      message: isWhitelisted,
    });

    await setCacheWithExpire(
      `isWhitelisted_${wallet}`,
      String(isWhitelisted || false),
      60 * 60 * 24
    );
  } else {
    res.send({
      status: "success",
      message: isWhitelistedCache,
    });
  }
});

module.exports = utilRouter;
