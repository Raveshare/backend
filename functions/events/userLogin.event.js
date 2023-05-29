const posthogClient = require('../../utils/posthog/posthogClient.js')

const userLogin = async (userId) => {
    try {
        await posthogClient.identify({
            distinctId: userId,
        })
    } catch (err) {
        console.log(err)
    }
}

module.exports = userLogin