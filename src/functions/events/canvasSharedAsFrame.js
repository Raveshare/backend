const posthogClient = require("../../utils/posthog/posthogClient.js");

const canvasSharedAsFrame = async (canvasId, userId, frameId) => {
  try {
    posthogClient.capture({
      distinctId: userId,
      event: "Canvas shared as Frame",
      properties: {
        canvasId: canvasId,
        frameId: frameId,
      },
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = canvasSharedAsFrame;
