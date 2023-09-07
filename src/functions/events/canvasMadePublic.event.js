const posthogClient = require('../../utils/posthog/posthogClient.js')

const canvasMadePublic = async (canvasId, userId) => {
    try {
        await posthogClient.capture({
            distinctId: userId,
            event: 'Canvas Made Public',
            properties: {
                canvasId: canvasId
            }
        })
    } catch (err) {
        console.log(err)
    }
}

module.exports = canvasMadePublic