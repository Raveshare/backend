const fs = require("fs");
const axios = require("axios");
const uploadImageToS3 = require("./uploadImageToS3");
const sizeOf = require("image-size");

const uploadImageFromLinkToS3 = async (link, address, fileName) => {
  try {
    let response = await axios.get(link, { responseType: "arraybuffer" });

    let dimensions = [0, 0];
    let format = response.headers["content-type"].split("/")[1];
    try {
    dimensions = sizeOf(response.data);

    let width = dimensions.width;
    let height = dimensions.height;
   format = dimensions.type;

    dimensions = [width, height];
    } catch (err) {

    }

    console.log(dimensions);

    let filepath = `user/${address}/nft/${fileName}.${format}`;

    let s3Link = await uploadImageToS3(response.data, filepath);
    return {
      dimensions,
      s3Link
    }
  } catch (err) {
    console.log(err);
    return null;
  }
};

module.exports = uploadImageFromLinkToS3;
