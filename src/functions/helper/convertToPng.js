const svg2img = require("svg2img");
const fs = require("fs");
/**
 * A function to convert SVG to PNG format.
 * @param {Buffer} buffer
 * @returns
 */
async function convertSVGToPng(bufferString) {
  bufferString = bufferString.replace(bufferString.split(",")[0] + ",", "");
  bufferString = decodeURIComponent(bufferString);
  let res
  await svg2img(bufferString, function (error, buffer) {
    res = buffer;
  });
  return res;
}

module.exports = convertSVGToPng;
