const lensRouter = require("express").Router();

const authenticate = require("../../lens/api-v2").authenticate;
const createProfileManager = require("../../lens/api-v2").createProfileManager;
const broadcastTx = require("../../lens/api-v2").broadcastTx;
const checkAccessToken = require("../../lens/api-v2").checkAccessToken;
const { refreshToken: refreshAccessToken } = require("../../lens/api-v2");
const { getCache, setCache } = require("../../functions/cache/handleCache");
const prisma = require("../../prisma");

lensRouter.post("/", async (req, res) => {
  let evm_address = req.user.evm_address;
  let user_id = req.user.user_id;
  let signature;

  try {
    signature = req.body.signature;
    id = req.body.id;
    profileId = req.body.profileId;
    profileHandle = req.body.profileHandle;
  } catch (error) {
    res.status(400).send({
      status: "failed",
      message: "Invalid Request Parameters",
    });
    return;
  }

  try {
    // again, this is based on challenge, so can't be cached

    // We can cache the authenticate data for a day.
    let authenticateData = await authenticate(id, signature);
    const { accessToken, refreshToken } = authenticateData;

    let ownerCache = await getCache(`user_${user_id}`);
    let ownerData;
    if (!ownerCache) {
      ownerData = await prisma.owners.findUnique({
        where: {
          id: user_id,
        },
      });
      await setCache(`user_${user_id}`, JSON.stringify(ownerData));
    } else {
      ownerData = JSON.parse(ownerCache);
    }

    if (!ownerData) {
      res.status(404).send({
        message: "User not found",
      });
    }

    ownerData.profileId = profileId;
    ownerData.lens_handle = profileHandle;

    ownerData.lens_auth_token = {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };

    await prisma.owners.update({
      where: {
        id: user_id,
      },
      data: ownerData,
    });

    res.status(200).send({
      status: "success",
      message: ownerData.lens_handle,
    });
  } catch (error) {
    res.status(500).send({
      message: `Invalid Server Error: ${error}`,
    });
  }
});

lensRouter.get("/set-profile-manager", async (req, res) => {
  let evm_address = req.user.evm_address;
  let user_id = req.user.user_id;

  let ownerCache = await getCache(`user_${user_id}`);
  let ownerData;
  if (!ownerCache) {
    ownerData = await prisma.owners.findUnique({
      where: {
        id: user_id,
      },
    });
    await setCache(`user_${user_id}`, JSON.stringify(ownerData));
  } else {
    ownerData = JSON.parse(ownerCache);
  }

  if (!ownerData) {
    res.status(404).send({
      message: "User not found",
    });
    return;
  }

  let { lens_auth_token } = ownerData;

  let { accessToken, refreshToken } = lens_auth_token;

  let isAccessTokenValid = await checkAccessToken(accessToken);

  if (!isAccessTokenValid) {
    const tokens = await refreshAccessToken(refreshToken);
    accessToken = tokens.accessToken;
    refreshToken = tokens.refreshToken;

    const lens_auth_token = {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };

    ownerData.lens_auth_token = lens_auth_token;

    await prisma.owners.update({
      where: {
        evm_address,
      },
      data: ownerData,
    });
  }

  let profileManagerTypedData = await createProfileManager(accessToken);

  res.status(200).send(profileManagerTypedData);
});

lensRouter.post("/broadcast-tx", async (req, res) => {
  let { id, signature } = req.body;
  let user_id = req.user.user_id;

  let resp = await broadcastTx(id, signature, user_id);

  res.status(200).send({
    message: resp,
  });
});

module.exports = lensRouter;
