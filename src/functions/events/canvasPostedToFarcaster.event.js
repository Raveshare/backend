const posthogClient = require('../../utils/posthog/posthogClient.js')

const canvasPostedToFarcaster = async (canvasId, userId) => {
    try {
        await posthogClient.capture({
            distinctId: userId,
            event: 'Canvas Posted To Farcaster',
            properties: {
                canvasId: canvasId
            }
        })
    } catch (err) {
        console.log(err)
    }
}

module.exports = canvasPostedToFarcaster