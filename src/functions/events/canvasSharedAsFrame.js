const mixpanelClient = require("../../utils/mixpanel/mixpanel.js");

const canvasSharedAsFrame = async (canvasId, userId, frameId) => {
  try {
    mixpanelClient.track("Canvas shared as Frame", {
      distinct_id: userId,
      canvasId: canvasId,
      frameId: frameId,
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = canvasSharedAsFrame;
