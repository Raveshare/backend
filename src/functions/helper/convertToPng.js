const sharp = require("sharp");

/**
 * A function to convert JPEG, PNG, WebP, AVIF, GIF, SVG, TIFF or raw pixel image data, to PNG format.
 * @param {Buffer} buffer
 * @returns
 */
async function convertToPng(buffer) {
  return await sharp(buffer).png().toBuffer();
}

module.exports = convertToPng;
