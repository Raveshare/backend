const mixpanelClient = require('../../utils/mixpanel/mixpanel.js');

const canvasPostedToLens = async (canvasId, userId) => {
    try {
        mixpanelClient.track('Canvas Posted To Lens', {
            distinct_id: userId,
            canvasId: canvasId,
        });
    } catch (err) {
        console.log(err);
    }
}

module.exports = canvasPostedToLens;
