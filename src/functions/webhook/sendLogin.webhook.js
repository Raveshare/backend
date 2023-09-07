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

  try {

  await axios.post(DISCORD_WEBHOOK_URL, error);

  } catch (error) {
    console.log(error);
  }
}

module.exports = sendLogin

