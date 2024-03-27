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
const {
  uploadMediaToIpfs,
  uploadJSONToIpfs,
} = require("../../functions/uploadToIPFS");
const {
  getCache,
  setCache,
  deleteCache,
} = require("../../functions/cache/handleCache");
const {
  canUseRemoveBG,
  usedRemoveBG,
} = require("../../functions/points/removeBG");
const { invitedUser } = require("../../functions/points/inviteUser");
const canvasSharedAsFrame = require("../../functions/events/canvasSharedAsFrame");
const usedRemoveBGEvent = require("../../functions/events/usedRemoveBG.event");
const Replicate = require("replicate");

const projectId = process.env.IPFS_PROJECT_ID;
const projectSecret = process.env.IPFS_PROJECT_SECRET;
const ipfs_auth =
  "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");
const { v4: uuid } = require("uuid");
const axios = require("axios");
const message = require("cabin/lib/message");

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

const NODE_ENV = process.env.NODE_ENV;

const BaseContractAddress =
  NODE_ENV === "production"
    ? "0x769C1417485ad9d74FbB27F4be47890Fd00A96ad"
    : "0x14a60C55a51b40B5A080A6E175a8b0FDae3565cF";

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
    usedRemoveBGEvent(user_id);

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

utilRouter.get("/get-slug-details", async (req, res) => {
  let { slug } = req.query;

  if (!slug) {
    return res.send({
      status: "error",
      message: "Invalid params",
    });
  }

  let sharedCanvas = await prisma.shared_mint_canvas.findUnique({
    where: {
      slug: slug,
    },
  });

  if (!sharedCanvas) {
    res.status(404).send({
      message: "Canvas Not Found",
    });
    return;
  }

  let canvas = await prisma.canvases.findUnique({
    where: {
      id: sharedCanvas.canvasId,
    },
    select: {
      imageLink: true,
    },
  });

  res.send({
    image: canvas?.imageLink[0] || "",
    contract: sharedCanvas.contract,
    chainId: sharedCanvas.chainId,
    contractType: sharedCanvas.contractType,
  });
});

utilRouter.post("/create-frame-data", auth, async (req, res) => {
  try {
    let userId = req.user.user_id;
    let owner = req.user.evm_address;
    let {
      canvasId,
      metadata,
      isLike,
      isRecast,
      isFollow,
      isTopUp,
      allowedMints,
      redirectLink,
      contractAddress,
      chainId,
      creatorSponsored,
      contractType,
      gatedChannel,
      gatedCollection,
    } = req.body;

    let imageIpfsLink;

    let canvas = await prisma.canvases.findUnique({
      where: {
        id: canvasId,
      },
      select: {
        imageLink: true,
      },
    });

    // image url s3
    let imageUrl = canvas.imageLink[0];

    let image_buffer = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });
    let image_blob = Buffer.from(image_buffer.data, "binary");
    imageIpfsLink = await uploadMediaToIpfs(image_blob);

    let metaData = {
      ...metadata,
      image: "https://lenspost.infura-ipfs.io/ipfs/" + imageIpfsLink,
    };

    let tokenUri =
      "https://lenspost.infura-ipfs.io/ipfs/" +
      (await uploadJSONToIpfs(metaData));

    if (gatedCollection) gatedCollection = `0x${gatedCollection}`;

    const data = {
      imageUrl,
      tokenUri,
      isLike,
      isRecast,
      isFollow,
      owner,
      isTopUp,
      allowedMints,
      redirectLink,
      chainId: parseInt(chainId),
      contract_address: contractAddress,
      contract_type: contractType,
      creatorSponsored,
      gatedChannel,
      gatedCollection,
    };

    let frame = await prisma.frames.create({
      data,
    });

    canvasSharedAsFrame(canvasId, userId, frame.id);

    res.status(200).send({ status: "success", frameId: frame.id });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ status: "error", message: error.message });
  }
});

utilRouter.post("/update-frame-data", async (req, res) => {
  try {
    let { frameId, minterAddress, txHash } = req.body;
    frameId = parseInt(frameId);

    let frame;
    let frameCache = await getCache(`frame-${frameId}`);
    if (!frameCache) {
      frame = await prisma.frames.findUnique({
        where: {
          id: frameId,
        },
      });
      await setCache(`frame-${frameId}`, JSON.stringify(data));
    } else {
      frame = await JSON.parse(frameCache);
    }

    const minterData = [...frame.minters, { minterAddress, txHash }];

    frame = await prisma.frames.update({
      where: {
        id: frameId,
      },
      data: {
        minters: minterData,
      },
    });

    await deleteCache(`frame-${frameId}`);
    await setCache(`frame-${frameId}`, JSON.stringify(frame));

    res.status(200).send({ status: "success" });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ status: "error", message: error.message });
  }
});

utilRouter.get("/get-frame-data", async (req, res) => {
  try {
    let { frameId } = req.query;
    frameId = parseInt(frameId);

    if (!frameId) {
      return res
        .status(400)
        .send({ status: "error", message: "No frameId provided" });
    }
    let data;
    let frameCache = await getCache(`frame-${frameId}`);
    if (!frameCache) {
      data = await prisma.frames.findUnique({
        where: {
          id: frameId,
        },
      });
      await setCache(`frame-${frameId}`, JSON.stringify(data));
    } else {
      data = JSON.parse(frameCache);
    }

    let slug = await prisma.shared_mint_canvas.findFirst({
      where: {
        contract: data.contract_address,
      },
    });

    data = {
      ...data,
      slug: slug?.slug || "",
    };

    res.status(200).send(data);
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ status: "error", message: error.message });
  }
});

utilRouter.get("/generate-image", auth, async (req, res) => {
  const galverse_model =
    "galverse/setc-t1_label:65a7ee5a8c875fe9f38111699edf72f6c07f84dda7b7be5720e843ebb9f9c876";

  const host = req.get("host");
  const webhook_url = `https://${host}/util/webhook-endpoint`;

  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  const prompt = req.query.prompt;

  if (!prompt) {
    return res
      .status(400)
      .send({ status: "failed", message: "No prompt provided" });
  }

  try {
    const output = await replicate.run(galverse_model, {
      input: {
        prompt: prompt,
      },
      webhook: webhook_url,
      webhook_events_filter: ["completed"],
    });

    res.status(200).send({ status: "success", message: output });
  } catch (error) {
    res.status(500).send({ status: "failed", message: error.message });
  }
});

utilRouter.post("/webhook-endpoint", (req, res) => {
  console.log("Webhook endpoint hit");
  // console.log("Request body:", req.body);
  res.status(200).send({ status: "success", message: "Webhook received" });
});

module.exports = utilRouter;
