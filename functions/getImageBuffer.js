const { createInstance } = require('polotno-node');

/**
 * Gets the image buffer from the JSON
 * @param {string} imageJSON - the JSON of the image
 * @returns {string} - returns the image buffer
 */
async function getImageBuffer(imageJSON) {

    const instance = await createInstance({
    key: process.env.POLOTNO_API_KEY,
  });

  const json = JSON.parse(imageJSON);

  const imageBase64 = await instance.jsonToImageBase64(json); 
  
  return imageBase64;
}

module.exports = getImageBuffer;