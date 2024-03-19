const mixpanel = require('mixpanel');
const MIXPANEL_API_KEY = process.env.MIXPANEL_API_KEY;

const mixpanelClient = mixpanel.init(MIXPANEL_API_KEY);

module.exports = mixpanelClient;