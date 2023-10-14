const solanaRouter = require("express").Router();

const nacl = require("tweetnacl");
const bs58 = require("bs58");
const prisma = require("../../prisma");
const generateJwt = require("../../utils/auth/generateJwt");

const jsonwebtoken = require("jsonwebtoken");

solanaRouter.post("/", async (req, res) => {
  // To check if the request is already authenticated, and user_id is present.
  let user_id = req.user?.user_id;
  let signature, message, solana_address;

  try {
    signature = req.body.signature;
    message = req.body.message;
    solana_address = req.body.solana_address;
  } catch (error) {
    res.status(400).send({
      status: "failed",
      message: "Invalid Request Parameters",
    });
    return;
  }

  try {
    let ownerData;

    // If the user is already authenticated then get tha USER else find the user using the solana address
    if (user_id) {
      ownerData = await prisma.owners.findUnique({
        where: {
          id: user_id,
        },
      });
    } else {
      ownerData = await prisma.owners.findUnique({
        where: {
          solana_address,
        },
      });
    }

    let isVerified = nacl.sign.detached.verify(
      new TextEncoder().encode(message),
      bs58.decode(signature),
      bs58.decode(solana_address)
    );

    if (!isVerified) {
      res.status(401).send({
        message:
          "Invalid Signature for Solana, please sign using correct message",
      });
      return;
    } else {
      // if the user is neither authenticated nor has a previous record, then create the record after user's signautre has been verified.
      if (!ownerData) {
        ownerData = await prisma.owners.create({
          data: {
            solana_address,
          },
        });
      }

      // to only send evm_address if the ownerData already has it, will happen in case where user is pre-authenticated.
      let jwt = generateJwt(ownerData.evm_address ? ownerData.evm_address : "" , solana_address , ownerData.id)

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
      message: `Invalid Server Error: ${error}`,
    });
  }
});

module.exports = solanaRouter;
