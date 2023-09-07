const axios = require('axios');
const DISCORD_WEBHOOK_URL  = process.env.DISCORD_WEBHOOK_URL;

const sendError = async (err) => {
  let error = {
    "content": "<@&1111241142772703321>",
    // "content": "Error in Deployment",
    "allowed_mentions": {
      "roles": ["1111241142772703321"],
    },
    "embeds": [
      {
        "title": "Deployment Error",
        "description": `Error in Deployment: ${err}`,
        "color": 16384000,
        "author": {
          "name": "Deployment"
        }
      }
    ],
  }

  await axios.post(DISCORD_WEBHOOK_URL, error);
}

module.exports = sendError;