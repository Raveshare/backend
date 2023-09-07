const posthogClient = require('../../utils/posthog/posthogClient.js')

const canvasCreated = async (canvasId, userId) => {
    try {
        await posthogClient.capture({
            distinctId: userId,
            event: 'Canvas Created',
            properties: {
                canvasId: canvasId
            }
        })
    } catch (err) {
        console.log(err)
    }
}

module.exports = canvasCreated