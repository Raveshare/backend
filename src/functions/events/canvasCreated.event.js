// Require the Mixpanel client from your project-specific location
const mixpanelClient = require('../../utils/mixpanel/mixpanel.js');

const canvasCreated = async (canvasId, userId) => {
    try {
        // Correctly structured event tracking with Mixpanel
        mixpanelClient.track('Canvas Created', {
            distinct_id: userId,
            canvasId: canvasId
        });
    } catch (err) {
        console.log(err);
    }
}

module.exports = canvasCreated;
