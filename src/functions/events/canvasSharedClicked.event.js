const mixpanelClient = require('../../utils/mixpanel/mixpanel.js');

const canvasSharedClicked = async (canvasId, userId) => {
    try {
        mixpanelClient.track('Canvas Shared as Link has been opened', {
            distinct_id: userId,
            canvasId: canvasId,
        });
    } catch (err) {
        console.log(err);
    }
}

module.exports = canvasSharedClicked;
