const solanaRouter = require("express").Router();

const nacl = require("tweetnacl");
const bs58 = require("bs58");
const prisma = require("../../prisma");

solanaRouter.post("/authenticate", async (req, res) => {
  let address = req.user.address;
  let signature, message, solana_address;

  try {
    signature = req.body.signature;
    message = req.body.message;
    solana_address = req.body.address;
  } catch (error) {
    res.status(400).send({
      status: "failed",
      message: "Invalid Request Parameters",
    });
    return;
  }


  try {
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

    let isVerified = nacl.sign.detached.verify(
      new TextEncoder().encode(message),
      bs58.decode(signature),
      bs58.decode(solana_address)
    );

    if (!isVerified) {
      res.status(401).send({
        message: "Invalid Signature",
      });
      return;
    } else {

      await prisma.owners.update({
        where: {
          address: address,
        },
        data: {
          solana_address: solana_address,
        },
      });

      res.status(200).send({
        status: "success",
      });
    }
  } catch (error) {
    res.status(500).send({
      message: `Invalid Server Error: ${error}`,
    });
  }
});


module.exports = solanaRouter;