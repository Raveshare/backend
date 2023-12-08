const farcasterRouter = require("express").Router;

const ed = require("ed25519-supercop");
import { getHubRpcClient, Message } from "@farcaster/js";

farcasterRouter.post("/connect", async (req, res) => {
  let address = req.user.address;

  const privateKey = ed.utils.randomPrivateKey();
  const publicKey = await ed.getPublicKey(privateKey);

  let token, deepLinkUrl;

  try {
    const response = await axios.post(
      "https://api.warpcast.com/v2/signer-requests",
      {
        publicKey,
      }
    );

    const result = response.data.result;
    token = result.token;
    deepLinkUrl = result.deepLinkUrl;
  } catch (error) {
    throw new Error(`Error initiating Signer Request: ${error.message}`);
  }

  try {
    const response = await axios.get(
      "https://api.warpcast.com/v2/signer-request",
      {
        params: { token },
      }
    );

    const signerRequest = response.data.result.signerRequest;

    if (signerRequest.base64SignedMessage) {
      console.log("Signer is approved with fid:", signerRequest.fid);
      res.status(200).send({
        message: "Signer is approved",
        base64SignedMessage: signerRequest.base64SignedMessage,
      });
    }
  } catch (error) {
    console.error("Error polling for Signer Request:", error.message);
  }
});

farcasterRouter.post("/submit", async (req, res) => {
  try {
    const base64SignedMessage = req.body.base64SignedMessage;

    const client = await getHubRpcClient("<your-hub-url>");
    const message = Message.decode(Buffer.from(base64SignedMessage, "base64"));
    client.submitMessage(message);
    res.status(200).send({
      message: "Message submitted",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});
module.exports = farcasterRouter;
