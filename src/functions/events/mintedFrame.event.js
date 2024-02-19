const posthogClient = require('../../utils/posthog/posthogClient.js')

const mintedFrame =  (userId, frameId, recipientAddress , isSponsored) => {
    try {
         posthogClient.capture({
            distinctId: userId,
            event: 'Minted as Frame',
            properties: {
                frameId: frameId,
                recipientAddress: recipientAddress,
                isSponsored: isSponsored
            }
        })
    } catch (err) {
        console.log(err)
    }
}

module.exports = mintedFrame