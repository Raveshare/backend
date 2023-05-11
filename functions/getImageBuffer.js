const { createInstance } = require('polotno-node');

/**
 * Gets the image buffer from the JSON
 * @param {string} imageJSON - the JSON of the image
 * @returns {string} - returns the image buffer
 */
async function getImageBuffer(imageJSON) {

  try {

    const instance = await createInstance({
      key: process.env.POLONTO_API_KEY,
    });

    // const json = JSON.parse(imageJSON);
    const json = imageJSON;

    const imageBase64 = await instance.jsonToImageBase64(json);
    console.log(imageBase64)
    let imageBuffer = Buffer.from(imageBase64, 'base64');

    return imageBuffer;
  } catch (error) {
    console.log(error)
    throw error;
  }
}

module.exports = getImageBuffer;