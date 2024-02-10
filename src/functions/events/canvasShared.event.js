const posthogClient = require('../../utils/posthog/posthogClient.js')

const canvasShared = async (canvasId, userId) => {
    try {
        await posthogClient.capture({
            distinctId: userId,
            event: 'Canvas Shared as Link',
            properties: {
                canvasId: canvasId
            }
        })
    } catch (err) {
        console.log(err)
    }
}

module.exports = canvasShared