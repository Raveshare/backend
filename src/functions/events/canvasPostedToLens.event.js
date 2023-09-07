const posthogClient = require('../../utils/posthog/posthogClient.js')

const canvasPostedToLens = async (canvasId, userId) => {
    try {
        await posthogClient.capture({
            distinctId: userId,
            event: 'Canvas Posted To Lens',
            properties: {
                canvasId: canvasId
            }
        })
    } catch (err) {
        console.log(err)
    }
}

module.exports = canvasPostedToLens