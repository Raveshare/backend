const { PostHog } = require('posthog-node')
const POSTHOG_API_KEY = process.env.POSTHOG_API_KEY

const posthogClient = new PostHog(POSTHOG_API_KEY, {
    host: 'https://app.posthog.com',
})

module.exports = posthogClient
