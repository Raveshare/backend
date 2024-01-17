const posthogClient = require("../../utils/posthog/posthogClient.js");

const canvasMintedToXChain = (canvasId, userId, platform = "", xChain) => {
  try {
    posthogClient.capture({
      distinctId: userId,
      event: `Canvas Posted To ${platform} ${xChain}`,
      properties: {
        canvasId: canvasId,
        hasMint: true,
      },
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = canvasMintedToXChain;
