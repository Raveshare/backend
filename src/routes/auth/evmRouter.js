const evmRouter = require("express").Router();
const lensRouter = require("./lensRouter");

const { verifyEthSignature } = require("../../utils/auth/verifySignature");
const generateJwt = require("../../utils/auth/generateJwt");
const auth = require("../../middleware/auth/auth");

const jsonwebtoken = require("jsonwebtoken");

const prisma = require("../../prisma");

const userLogin = require("../../functions/events/userLogin.event");
const sendLogin = require("../../functions/webhook/sendLogin.webhook");

evmRouter.post("/", async (req, res) => {
  // To check if the request is already authenticated, and user_id is present.
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

    let isVerified = verifyEthSignature(evm_address , signature , message)

    if (!isVerified) {
      res.status(401).send({
        message:
          "Invalid Signature for EVM, please sign using correct message",
      });
      return;
    } else {
      // if the user is neither authenticated nor has a previous record, then create the record after user's signautre has been verified.
      if (!ownerData) {
        ownerData = await prisma.owners.create({
          data: {
            evm_address,
          },
        });
      }

      // to only send evm_address if the ownerData already has it, will happen in case where user is pre-authenticated.
      let jwt = generateJwt(evm_address, ownerData.solana_address ? ownerData.solana_address : "" , ownerData.id)

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

      res.status(200).send({
        status: "success",
        message : hasExpired ? "" : (ownerData.lens_handle ? ownerData.lens_handle : ""),
        jwt
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
