const canvasSchema = require("../schema/canvasSchema");
const uploadImageToS3 = require("./uploadImageToS3");
const { uploadMediaToIpfs } = require("./uploadToIPFS");
const purgeImageCache = require("./purgeImageCache");

const updateImagePreview = async (previewData, user_id, id) => {
  try {
    let url = [],
      ipfs = [];

    for (let i = 0; i < previewData.length; i++) {
      let filename = `user/${user_id}/canvases/${id}-${i}.png`;
      previewData[i] = previewData[i].replace(/^data:image\/png;base64,/, "");
      previewData[i] = Buffer.from(previewData[i], "base64");
      url.push(await uploadImageToS3(previewData[i], filename));
      ipfs.push(await uploadMediaToIpfs(previewData[i]));

      purgeImageCache(`http://lenspost.b-cdn.net/${filename}`);
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
