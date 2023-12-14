const farcasterRouter = require("express").Router();
const { NeynarAPIClient } = require("@neynar/nodejs-sdk");
const jsonwebtoken = require("jsonwebtoken");
const ethers = require("ethers");
const axios = require("axios");

// Initializing Neynar Client via Neynar API Key
const client = new NeynarAPIClient(process.env.NEYNAR_API_KEY);
const FARCASTER_DEVELOPER_MNEMONIC = process.env.FARCASTER_DEVELOPER_MNEMONIC;

const FARCASTER_DEVELOPER_FID = process.env.FARCASTER_DEVELOPER_FID;

const generate_signature = async function (public_key) {
  // DO NOT CHANGE ANY VALUES IN THIS CONSTANT
  const SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN = {
    name: "Farcaster SignedKeyRequestValidator",
    version: "1",
    chainId: 10,
    verifyingContract: "0x00000000fc700472606ed4fa22623acf62c60553",
  };

  // DO NOT CHANGE ANY VALUES IN THIS CONSTANT
  const SIGNED_KEY_REQUEST_TYPE = [
    { name: "requestFid", type: "uint256" },
    { name: "key", type: "bytes" },
    { name: "deadline", type: "uint256" },
  ];

  const wallet = ethers.Wallet.fromMnemonic(FARCASTER_DEVELOPER_MNEMONIC);

  // Generates an expiration date for the signature
  // e.g. 1693927665
  const deadline = Math.floor(Date.now() / 1000) + 86400; // signature is valid for 1 day from now

  const domain = {
    name: SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN.name,
    version: SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN.version,
    chainId: SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN.chainId,
    verifyingContract:
      SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN.verifyingContract,
  };

  const types = {
    SignedKeyRequest: SIGNED_KEY_REQUEST_TYPE,
  };

  const value = {
    requestFid: BigInt(FARCASTER_DEVELOPER_FID),
    key: public_key,
    deadline: BigInt(deadline),
  };

  const signature = await wallet._signTypedData(domain, types, value);

  return { deadline, signature };
};

farcasterRouter.post("/", async (req, res) => {
  try {
    let evm_address = req.user.evm_address;
    // const user = (await client.lookupUserByVerification(evm_address)).result
    //   .user;

    // const signer = await client.createSigner();

    // let regSign = await client.createSigner();

    try {
      const createSignerResponse = await client.createSigner();

      const { deadline, signature } = await generate_signature(
        createSignerResponse.public_key
      );
      console.log(signature);

      const signedKeyResponse = await client.registerSignedKey({
        signer_uuid: createSignerResponse.signer_uuid,
        app_fid: FARCASTER_DEVELOPER_FID,
        deadline,
        signature,
      });

      res.status(200).json({ message: signedKeyResponse.data });
    } catch (error) {
      console.log(error);
      res.status(401).send({
        message: error.message,
      });
    }
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
  }
});

module.exports = farcasterRouter;
