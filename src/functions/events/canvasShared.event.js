const mixpanelClient = require('../../utils/mixpanel/mixpanel.js');

const canvasShared = async (canvasId, userId) => {
    try {
        mixpanelClient.track('Canvas Shared as Link', {
            distinct_id: userId,
            canvasId: canvasId,
        });
    } catch (err) {
        console.log(err);
    }
}

module.exports = canvasShared;
