const axios = require("axios");

const BUNNY_API_SECRET = process.env.BUNNY_API_SECRET;

const purgeImageCache = async (url) => {
  try {
    let res = await axios.post(
      `https://api.bunny.net/purge?url=${url}`,
      {},
      {
        headers: {
          AccessKey: BUNNY_API_SECRET,
          "Content-Type": "application/json",
        },
      }
    );

    if (res.status !== 200) {
      console.log("Error purging image cache for url: ", url);
      return false;
    }

    return true;
  } catch (e) {
    console.log("Error purging image cache for url: ", url);
    return false;
  }
};


module.exports = purgeImageCache;
