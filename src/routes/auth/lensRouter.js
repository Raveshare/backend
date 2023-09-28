const lensRouter = require("express").Router();

const challenge = require("../../lens/api").challenge;
const authenticate = require("../../lens/api").authenticate;
const getFollowContractAddress =
  require("../../lens/api").getFollowContractAddress;
const getProfileHandleAndId = require("../../lens/api").getProfileHandleAndId;
const setDispatcher = require("../../lens/api").setDispatcher;
const checkAccessToken = require("../../lens/api").checkAccessToken;
const { refreshToken: refreshAccessToken } = require("../../lens/api");

const prisma = require("../../prisma");

lensRouter.get("/challenge", async (req, res) => {
  let address = req.user.address;
  let challengeData = await challenge(address);
  res.status(200).send({
    challenge: challengeData,
  });
});

lensRouter.post("/authenticate", async (req, res) => {
  let address = req.user.address;
  let signature;

  try {
    signature = req.body.signature;
  } catch (error) {
    res.status(400).send({
      status: "failed",
      message: "Invalid Request Parameters",
    });
    return;
  }

  try {
    let authenticateData = await authenticate(address, signature);
    const { accessToken, refreshToken } = authenticateData;

    let ownerData = await prisma.owners.findUnique({
      where: {
        address: address,
      },
    });

    if (!ownerData) {
      res.status(404).send({
        message: "User not found",
      });
    }

    let { handle, id } = await getProfileHandleAndId(address);
    let followNftAddress = await getFollowContractAddress(id);

    ownerData.profileId = id;
    ownerData.followNftAddress = followNftAddress;
    ownerData.lens_handle = handle;

    ownerData.lens_auth_token = {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };

    await prisma.owners.update({
      where: {
        address: address,
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

lensRouter.get("/set-dispatcher", async (req, res) => {
  let address = req.user.address;

  let ownerData = await prisma.owners.findUnique({
    where: {
      address: address,
    },
  });

  if (!ownerData) {
    res.status(404).send({
      message: "User not found",
    });
    return;
  }

  let { profileId, lens_auth_token } = ownerData;

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

    prisma.owners.update({
      where: {
        address: address,
      },
      data: ownerData,
    });
  }

  let setDispatcherData = await setDispatcher(profileId, accessToken);

  res.status(200).send({
    message: setDispatcherData,
  });
});

module.exports = lensRouter;
