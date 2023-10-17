const utilRouter = require("express").Router();
const uploadImageToS3 = require("../../functions/uploadImageToS3");
const checkDispatcher = require("../../lens/api").checkDispatcher;
const { removeBackgroundFromImageUrl } = require("remove.bg");
const getIsWhitelisted = require("../../functions/getIsWhitelisted");
const auth = require("../../middleware/auth/auth");
const prisma = require("../../prisma");

const cache = require("../../middleware/cache");

const { getCache, setCacheWithExpire } = require("../../functions/handleCache");

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
  let ownerAddress = req.user.address;

  let owner = await prisma.owners.findUnique({
    where: {
      address: ownerAddress,
    },
  });

  console.log(owner);

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
  let isWhitelistedCache = await getCache(`isWhitelisted_${wallet}`);

  if (!isWhitelistedCache) {
    let isWhitelisted = await getIsWhitelisted(wallet);
    res.send({
      status: "success",
      message: isWhitelisted,
    });

    await setCacheWithExpire(
      `isWhitelisted_${wallet}`,
      isWhitelisted,
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
