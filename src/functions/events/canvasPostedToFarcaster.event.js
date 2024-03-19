const mixpanelClient = require('../../utils/mixpanel/mixpanel.js');

const canvasPostedToFarcaster = async (canvasId, userId) => {
    try {
        mixpanelClient.track('Canvas Posted To Farcaster', {
            distinct_id: userId,
            canvasId: canvasId,
        });
    } catch (err) {
        console.log(err);
    }
}

module.exports = canvasPostedToFarcaster;
