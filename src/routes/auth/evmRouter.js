const evmRouter = require("express").Router();
const lensRouter = require("./lensRouter");

const { verifyEthSignature } = require("../../utils/auth/verifySignature");
const generateJwt = require("../../utils/auth/generateJwt");
const auth = require("../../middleware/auth/auth");

const jsonwebtoken = require("jsonwebtoken");

const prisma = require("../../prisma");

const userLogin = require("../../functions/events/userLogin.event");
const sendLogin = require("../../functions/webhook/sendLogin.webhook");
const { getCache, setCache } = require("../../functions/cache/handleCache");

evmRouter.post("/", async (req, res) => {
  // To check if the request is already authenticated, and user_id is present.

  try {
    token = req.headers.authorization.split(" ")[1];
    decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
  } catch {}

  let user_id = req.user?.user_id;
  let signature, message, evm_address;

  try {
    signature = req.body.signature;
    message = req.body.message;
    evm_address = req.body.evm_address;
  } catch (error) {
    res.status(400).send({
      status: "failed",
      message: "Invalid Request Parameters",
    });
    return;
  }

  try {
    let ownerData;

    // If the user is already authenticated then get tha USER else find the user using the evm address
    // Cache the user's data for a day.
    if (user_id) {
      let ownerDataCache = await getCache(`user_${user_id}`);

      if (!ownerDataCache) {
        ownerData = await prisma.owners.findUnique({
          where: {
            id: user_id,
          },
        });
        await setCache(`user_${user_id}`, JSON.stringify(ownerData));
      } else {
        ownerData = JSON.parse(ownerDataCache);
      }
    } else {
      let ownerDataCache = await getCache(`user_${evm_address}`);

      if (!ownerDataCache) {
        ownerData = await prisma.owners.findUnique({
          where: {
            evm_address,
          },
        });
        await setCache(`user_${evm_address}`, JSON.stringify(ownerData));
      } else {
        ownerData = JSON.parse(ownerDataCache);
      }
    }

    let isVerified = verifyEthSignature(evm_address, signature, message);

    if (!isVerified) {
      res.status(401).send({
        message: "Invalid Signature for EVM, please sign using correct message",
      });
      return;
    } else {
      // if the user is neither authenticated nor has a previous record, then create the record after user's signautre has been verified.

      // we can cache the user's data till the time it get's updated
      // like in case of new auth_token getting generated

      // We can also cache the user's data for a day.
      if (!ownerData) {
        ownerData = await prisma.owners.create({
          data: {
            evm_address,
          },
        });
      } else {
        // if the user is already present, then update the user's data.
        await prisma.owners.update({
          where: {
            id: ownerData.id,
          },
          data: {
            evm_address,
          },
        });
      }

      // to only send evm_address if the ownerData already has it, will happen in case where user is pre-authenticated.
      let jwt = generateJwt(
        evm_address,
        ownerData.solana_address ? ownerData.solana_address : "",
        ownerData.id
      );

      // to check for lens_handle if lens_auth_token are present.
      let hasExpired = false;
      if (ownerData.lens_auth_token) {
        let { accessToken, refreshToken } = ownerData.lens_auth_token;

        if (!accessToken || !refreshToken) {
          hasExpired = true;
        } else {
          const decodedToken = jsonwebtoken.decode(refreshToken, {
            complete: true,
          });

          hasExpired = decodedToken?.payload.exp < Date.now() / 1000;
        }
      }

      if (!user_id)
        sendLogin(
          ownerData.id,
          ownerData.evm_address,
          ownerData.solana_address
        );

      res.status(200).send({
        status: "success",
        profileId: ownerData.profileId ? ownerData.profileId : "",
        profileHandle: hasExpired
          ? ""
          : ownerData.lens_handle
          ? ownerData.lens_handle
          : "",
        jwt,
      });
    }
  } catch (error) {
    res.status(500).send({
      status: "failed",
      message: `Internal Server Error ${error.message}`,
    });
  }
});

evmRouter.use("/lens", auth, lensRouter);

module.exports = evmRouter;
