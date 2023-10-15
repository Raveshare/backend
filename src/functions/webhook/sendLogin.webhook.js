const axios = require('axios');
const DISCORD_WEBHOOK_URL  = process.env.DISCORD_WEBHOOK_URL;

const sendLogin = async (user_id, ethereum_address, solana_address) => {
  let error = {
    "content": "",
    "embeds": [
      {
        "title": "A user has logged in",
        "description": `Eth: ${ethereum_address}\nSol: ${solana_address}\nUser ID: ${user_id}`,
        "color": 5814783,
        "author": {
          "name": "Deployment"
        }
      }
    ],
  }

  try {

  let res = await axios.post(DISCORD_WEBHOOK_URL, error);
  } catch (error) {
    console.log(error);
  }
}

module.exports = sendLogin

