const axios = require('axios');
const DISCORD_WEBHOOK_URL  = process.env.DISCORD_WEBHOOK_URL;

const sendLogin = async (address) => {
  let error = {
    "content": "",
    "embeds": [
      {
        "title": "A user has logged in",
        "description": `Address: ${address}`,
        "color": 5814783,
        "author": {
          "name": "Deployment"
        }
      }
    ],
  }

  await axios.post(DISCORD_WEBHOOK_URL, error);
}

module.exports = sendLogin

