const canvasSchema = require("../schema/canvasSchema");
const uploadImageToS3 = require("./uploadImageToS3");
const { uploadMediaToIpfs } = require("./uploadToIPFS");

const updateImagePreview = async (previewData, address, id) => {
  try {
    let url = [],
      ipfs = [];

    for (let i = 0; i < previewData.length; i++) {
      let filename = `user/${address}/canvases/${id}-${i}.png`;
      previewData[0] = Buffer.from(previewData[0], "base64");
      url.push(await uploadImageToS3(previewData[0], filename));
      ipfs.push(await uploadMediaToIpfs(previewData[0]));
    }

    canvasSchema.update(
      { imageLink: url, ipfsLink: ipfs },
      {
        where: {
          id: id,
        },
      }
    );
  } catch (err) {
    console.log(err);
  }
};

module.exports = updateImagePreview;
