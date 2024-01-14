const posthogClient = require("../../utils/posthog/posthogClient.js");

const canvasMintedToXChain = (canvasId, userId, xChain) => {
  try {
    posthogClient.capture({
      distinctId: userId,
      event: `Canvas Posted To Farcaster ${xChain}`,
      properties: {
        canvasId: canvasId,
      },
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = canvasMintedToXChain;
