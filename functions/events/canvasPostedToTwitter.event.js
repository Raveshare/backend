const posthogClient = require('../../utils/posthog/posthogClient.js')

const canvasPostedToTwitter = async (canvasId, userId) => {
    try {
        await posthogClient.capture({
            distinctId: userId,
            event: 'Canvas Posted To Twitter',
            properties: {
                canvasId: canvasId
            }
        })
    } catch (err) {
        console.log(err)
    }
}

module.exports = canvasPostedToTwitter