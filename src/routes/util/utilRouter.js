const utilRouter = require("express").Router();
const uploadImageToS3 = require("../../functions/image/uploadImageToS3");
const checkProfileManager = require("../../lens/api-v2").checkProfileManager;
const { removeBackgroundFromImageUrl } = require("remove.bg");
const {
  getIsWhitelisted,
} = require("../../functions/whitelist/getIsWhitelisted");
const addToWhitelist = require("../../functions/whitelist/addToWhitelist");
const auth = require("../../middleware/auth/auth");
const prisma = require("../../prisma");
const { uploadMediaToIpfs } = require("../../functions/uploadToLighthouse");
const { getCache, setCache } = require("../../functions/cache/handleCache");
const {
  canUseRemoveBG,
  usedRemoveBG,
} = require("../../functions/points/removeBG");
const { invitedUser } = require("../../functions/points/inviteUser");

const projectId = process.env.IPFS_PROJECT_ID;
const projectSecret = process.env.IPFS_PROJECT_SECRET;
const ipfs_auth =
  "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");
const { v4: uuid } = require("uuid");
const axios = require("axios");

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

utilRouter.get("/search-channel", async (req, res) => {
  let { channel } = req.query;

  const response = await axios({
    method: "get",
    url: "https://api.neynar.com/v2/farcaster/channel/search?q=" + channel,
    headers: {
      accept: "application/json",
      api_key: process.env.NEYNAR_API_KEY,
    },
  });

  res.send({
    message: response.data?.channels || [],
  });
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

utilRouter.post("/redeem-code", async (req, res) => {
  let { code, address } = req.body;

  if (!code) {
    return res.send({
      status: "error",
      message: "No code provided",
    });
  }

  let referralCode = await prisma.referral.findUnique({
    where: {
      referralCode: code,
    },
  });
  if (!referralCode) {
    return res.send({
      status: "error",
      message: "Invalid code",
    });
  }
  if (referralCode.hasClaimed) {
    return res.send({
      status: "error",
      message: "Code already claimed",
    });
  }

  await invitedUser(referralCode.ownerId);

  await prisma.referral.update({
    where: {
      referralCode: code,
    },
    data: {
      hasClaimed: true,
      referred: address,
    },
  });

  await addToWhitelist(address);

  res.send({
    status: "success",
    message: "Code successfully claimed",
  });
});

utilRouter.get("/get-image-canvas", async (req, res) => {
  let { id } = req.query;

  id = parseInt(id);

  if (!id) {
    return res.send({
      status: "error",
      message: "No id provided",
    });
  }

  let canvas = await prisma.canvases.findUnique({
    where: {
      id: id,
    },
  });

  if (!canvas) {
    return res.send({
      status: "error",
      message: "No canvas found",
    });
  }

  res.send({
    status: "success",
    message: canvas.imageLink[0],
  });
});

utilRouter.post("/create-frame-data", async (req, res) => {
  let { frameId, imageUrl, tokenUri, isLike, isRecast, isFollow } = req.body;

  const data = {
    frameId,
    imageUrl,
    tokenUri,
    isLike,
    isRecast,
    isFollow,
  };

  await prisma.frames.createMany({
    data: data,
  });

  res.status(200).send({ status: "success" });
});

utilRouter.post("/update-frame-data", async (req, res) => {
  let {
    frameId,
    imageUrl,
    tokenUri,
    minterAddress,
    txHash,
    isLike,
    isRecast,
    isFollow,
  } = req.body;

  const frameData = await prisma.frames.findMany({
    where: {
      frameId: frameId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (frameData.length === 0) {
    res.send({ status: "error", message: "No frame found" });
    return;
  }

  if (frameData[0].txHash === null) {
    await prisma.frames.update({
      where: {
        id: frameData[0].id,
      },
      data: {
        imageUrl,
        tokenUri,
        minterAddress,
        txHash,
        isLike,
        isRecast,
        isFollow,
      },
    });
  } else {
    await prisma.frames.create({
      data: {
        frameId,
        imageUrl,
        tokenUri,
        minterAddress,
        txHash,
        isLike,
        isRecast,
        isFollow,
      },
    });
  }

  res.status(200).send({ status: "success" });
});

utilRouter.get("/get-frame-data", async (req, res) => {
  let { frameId } = req.query;
  frameId = parseInt(frameId);
  const data = await prisma.frames.findMany({
    where: {
      frameId: frameId,
    },
  });
  res.status(200).send({ status: "success", data });
});

module.exports = utilRouter;
