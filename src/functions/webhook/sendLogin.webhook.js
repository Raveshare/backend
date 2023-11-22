const axios = require('axios');
const DISCORD_WEBHOOK_URL  = process.env.DISCORD_WEBHOOK_URL;

const NODE_ENV = process.env.NODE_ENV;

const sendLogin = async (user_id, ethereum_address, solana_address, username ="") => {
  let error = {
    "content": "",
    "embeds": [
      {
        "title": "A user has logged in",
        "description": `Eth: ${ethereum_address}\nSol: ${solana_address}\nUser ID: ${user_id} \nUsername: ${username}`,
        "color": 5814783,
        "author": {
          "name": NODE_ENV === "production" ? "PRODUCTION" : "DEVELOPMENT"
        },
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

