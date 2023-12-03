const utilRouter = require("express").Router();
const uploadImageToS3 = require("../../functions/helper/uploadImageToS3");
const checkProfileManager = require("../../lens/api-v2").checkProfileManager;
const { removeBackgroundFromImageUrl } = require("remove.bg");
const getIsWhitelisted = require("../../functions/getIsWhitelisted");
const auth = require("../../middleware/auth/auth");
const prisma = require("../../prisma");
const { uploadMediaToIpfs } = require("../../functions/uploadToIPFS");
const { getCache, setCache } = require("../../functions/cache/handleCache");
const {
  canUseRemoveBG,
  usedRemoveBG,
} = require("../../functions/points/removeBG");

const projectId = process.env.IPFS_PROJECT_ID;
const projectSecret = process.env.IPFS_PROJECT_SECRET;
const ipfs_auth =
  "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");
const { v4: uuid } = require("uuid");

const getIpfsClient = async () => {
  const { create } = await import("ipfs-http-client");

  const ipfsClient = create({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
    headers: {
      authorization: ipfs_auth,
    },
  });

  return ipfsClient;
};

utilRouter.get("/", async (req, res) => {
  res.send("Util Router");
});

utilRouter.post("/remove-bg", auth, async (req, res) => {
  let user_id = req.user.user_id;
  let { image, id } = req.query;

  if (!image) return res.send({ error: "No image provided" });

  let canUse = await canUseRemoveBG(user_id);

  if (!canUse) {
    return res.send({
      error: "Not enough points :(",
    });
  }

  try {
    removebg = await removeBackgroundFromImageUrl({
      apiKey: process.env.REMOVE_BG_API_KEY,
      url: image,
    });

    let imageBuffer = Buffer.from(removebg.base64img, "base64");

    let result = await uploadImageToS3(imageBuffer, `temp/${Date.now()}.png`);

    await usedRemoveBG(user_id);

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
    await setCache(`user_${user_id}`, JSON.stringify(owner));
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

    await setCache(`isWhitelisted_${wallet}`, isWhitelisted ? "true" : "false");
    res.send({
      status: "success",
      message: isWhitelisted,
    });
  } else {
    res.send({
      status: "success",
      message: isWhitelistedCache,
    });
  }
});

utilRouter.post("/upload-image-ipfs", auth, async (req, res) => {
  let user_id = req.user.user_id;
  let { image } = req.body;

  if (!image) return res.status(404).send({ error: "No image provided" });

  try {
    let imageBuffer = Buffer.from(image, "base64");

    let result = await uploadMediaToIpfs(imageBuffer);

    res.send({
      message: result,
    });
    return;
  } catch (err) {
    console.log(err);
    return res.status(503).send({ error: "Error uploading image" });
  }
});

utilRouter.post("/upload-json-ipfs", auth, async (req, res) => {
  let user_id = req.user.user_id;
  let { json } = req.body;

  const ipfsClient = await getIpfsClient();

  if (!json) return res.status(404).send({ error: "No image provided" });

  try {
    json = JSON.stringify(json);

    const { path } = await ipfsClient.add(json);

    res.send({
      message: path,
    });
    return;
  } catch (err) {
    console.log(err);
    return res.status(503).send({ error: "Error uploading image" });
  }
});

utilRouter.get("/check-coinvise/:wallet", async (req, res) => {
  let { wallet } = req.params;

  let owner = await prisma.owners.findUnique({
    where: {
      evm_address: wallet,
    },
  });

  if (!owner) {
    res.send({
      status: "success",
      message: false,
    });
    return;
  }

  let hasCreatedPublicTemplate = await prisma.canvases.findFirst({
    where: {
      isPublic: true,
      ownerId: owner.id,
    },
  });

  if (hasCreatedPublicTemplate) {
    res.send({
      status: "success",
      message: true,
    });
  } else {
    res.send({
      status: "success",
      message: false,
    });
  }
});

module.exports = utilRouter;
