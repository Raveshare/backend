const mixpanelClient = require('../../utils/mixpanel/mixpanel.js');

const canvasPostedToTwitter = async (canvasId, userId) => {
    try {
        mixpanelClient.track('Canvas Posted To Twitter', {
            distinct_id: userId,
            canvasId: canvasId,
        });
    } catch (err) {
        console.log(err);
    }
}

module.exports = canvasPostedToTwitter;
