const posthogClient = require('../../utils/posthog/posthogClient.js')

const canvasSharedClicked = async (canvasId, userId) => {
    try {
        await posthogClient.capture({
            distinctId: userId,
            event: 'Canvas Shared as Link has been opened',
            properties: {
                canvasId: canvasId
            }
        })
    } catch (err) {
        console.log(err)
    }
}

module.exports = canvasSharedClicked