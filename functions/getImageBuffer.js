const { createInstance } = require('polotno-node');

/**
 * Gets the image buffer array from the JSON
 * @param {string} imageJSON - the JSON of the image
 * @returns {string} - returns the image buffer
 */
async function getImageBuffer(imageJSON) {

  try {

    const instance = await createInstance({
      key: process.env.POLONTO_API_KEY,
    });

    let imageBuffer = []

    const json = JSON.parse(imageJSON);
    // const json = imageJSON;

    let pages = json.pages;
    for (let i = 0; i < pages.length; i++) {
      let id = pages[i].id;

      const imageBase64 = await instance.jsonToImageBase64(json, {
        pageId: id,
      });
      imageBuffer.push(Buffer.from(imageBase64, 'base64'));
    }

    return imageBuffer;
  } catch (error) {
    console.log(error)
    throw error;
  }
}

module.exports = getImageBuffer;