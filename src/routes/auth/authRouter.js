const authRouter = require("express").Router();
const lensRouter = require("./lensRouter");
const twitterRouter = require("./twitterRouter");

const { verifyEthSignature } = require("../../utils/auth/verifySignature");
const generateJwt = require("../../utils/auth/generateJwt");
const auth = require("../../middleware/auth/auth");

const jsonwebtoken = require("jsonwebtoken");

const prisma = require("../../prisma");

const userLogin = require("../../functions/events/userLogin.event");
const sendLogin = require("../../functions/webhook/sendLogin.webhook");

authRouter.get("/", async (req, res) => {
  res.send("Auth Router");
});

authRouter.post("/login", async (req, res) => {
  let address, signature, message;

  try {
    signature = req.body.signature;
    message = req.body.message;
    address = req.body.address;
  } catch (error) {
    res.status(400).send({
      status: "failed",
      message: "Invalid Request Parameters",
    });
    return;
  }

  try {
    let isVerified = await verifyEthSignature(address, signature, message);
    console.log(isVerified);
    if (isVerified) {
      let ownerData = await prisma.owners.findUnique({
        where: {
          address: address,
        },
      });

      //   if owner is not in db, create a new owner
      if (!ownerData) {
        ownerData = await prisma.owners.create({
          data: {
            address: address,
          },
        });
      }

      //   if the jwt of lens has expired, the frontend will generate a new jwt
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

      let jwt = generateJwt(address, signature);

      userLogin(address);
      sendLogin(address);

      res.status(200).send({
        status: "success",
        message: hasExpired ? "" : ownerData.lens_handle,
        jwt: jwt,
      });
    } else {
      res.status(200).send({
        status: "failed",
        message: "Signature Verification Failed",
      });
    }
  } catch (error) {
    res.status(500).send({
      status: "failed",
      message: `Internal Server Error ${error.message}`,
    });
  }
});

authRouter.use("/lens", auth, lensRouter);
authRouter.use("/twitter", auth, twitterRouter);

module.exports = authRouter;
