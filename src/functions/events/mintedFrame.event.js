const mixpanelClient = require('../../utils/mixpanel/mixpanel.js');

const mintedFrame =  (userId, frameId, recipientAddress , isSponsored) => {
    try {
         mixpanelClient.track('Minted as Frame', {
            distinct_id: userId,
            frameId: frameId,
            recipientAddress: recipientAddress,
            isSponsored: isSponsored,
        });
    } catch (err) {
        console.log(err);
    }
}

module.exports = mintedFrame;
