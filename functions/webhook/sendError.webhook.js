const axios = require('axios');
const DISCORD_WEBHOOK_URL  = process.env.DISCORD_WEBHOOK_URL;

const sendError = async (err) => {
  let error = {
    "content": "Error in Development",
    "embeds": [
      {
        "title": "Deployment Error",
        "description": `Error in Deployment: ${err}`,
        "color": 5814783,
        "author": {
          "name": "Deployment"
        }
      }
    ],
  }

  await axios.post(DISCORD_WEBHOOK_URL, error);
}

module.exports = sendError;