const mixpanelClient = require("../../utils/mixpanel/mixpanel.js");

const canvasMintedToXChain = (canvasId, userId, platform = "", xChain) => {
  try {
    mixpanelClient.track(`Canvas Posted To ${platform} ${xChain}`, {
      distinct_id: userId,
      canvasId: canvasId,
      hasMint: true,
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = canvasMintedToXChain;
