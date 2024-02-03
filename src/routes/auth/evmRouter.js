const evmRouter = require("express").Router();
const lensRouter = require("./lensRouter");
const farcasterRouter = require("./farcasterRouter");
const { verifyEthSignature } = require("../../utils/auth/verifySignature");
const generateJwt = require("../../utils/auth/generateJwt");
const auth = require("../../middleware/auth/auth");
const jsonwebtoken = require("jsonwebtoken");
const prisma = require("../../prisma");
const sendLogin = require("../../functions/webhook/sendLogin.webhook");
const sendMail = require("../../functions/mail/sendMail");

evmRouter.post("/", async (req, res) => {
  // To check if the request is already authenticated, and user_id is present.

  try {
    token = req.headers.authorization.split(" ")[1];
    decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
  } catch {}

  let user_id = req.user?.user_id;
  let signature, message, evm_address, username, mailId;

  try {
    signature = req.body.signature;
    message = req.body.message;
    evm_address = req.body.evm_address;
    username = req.body.username;
    mailId = req.body.mailId;
  } catch (error) {
    res.status(400).send({
      status: "failed",
      message: "Invalid Request Parameters",
    });
    return;
  }

  try {
    let ownerData;
    if (user_id) {
      ownerData = await prisma.owners.findUnique({
        where: {
          id: user_id,
        },
      });
    } else {
      ownerData = await prisma.owners.findUnique({
        where: {
          evm_address,
        },
      });
    }

    let isVerified = verifyEthSignature(evm_address, signature, message);
    // isVerified = true;

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
        username && mailId && sendMail(mailId, "Lenspost Login", username);
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
        ownerData.id,
        ownerData.farcaster_id
      );

      // to check for lens_handle if lens_auth_token are present.
      let hasExpired = true;
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

      sendMail("aryan@lenspost.xyz", "Lenspost Login", "0xaryan")

      if (!user_id)
        sendLogin(
          ownerData.id,
          ownerData.evm_address,
          ownerData.solana_address,
          ownerData.username
        );

      res.status(200).send({
        status: "success",
        profileId: hasExpired
          ? ""
          : ownerData.profileId
          ? ownerData.profileId
          : "",
        profileHandle: hasExpired
          ? ""
          : ownerData.lens_handle
          ? ownerData.lens_handle
          : "",
        jwt,
        userId: ownerData.id,
        username: ownerData.username || "",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "failed",
      message: `Internal Server Error ${error.message}`,
    });
  }
});

evmRouter.use("/lens", auth, lensRouter);
evmRouter.use("/farcaster", auth, farcasterRouter);

module.exports = evmRouter;
