// Assuming the Mixpanel client setup is similar to the previous example
const mixpanelClient = require('../../utils/mixpanel/mixpanel.js');

const canvasMadePublic = async (canvasId, userId) => {
    try {
        // Track an event with Mixpanel using the corrected structure
        mixpanelClient.track('Canvas Made Public', {
            distinct_id: userId,
            canvasId: canvasId,
        });
    } catch (err) {
        console.log(err);
    }
}

module.exports = canvasMadePublic;
