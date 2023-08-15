const canvasSchema = require("../schema/canvasSchema");
const uploadImageToS3 = require("./uploadImageToS3");
const { uploadMediaToIpfs } = require("./uploadToIPFS");

const updateImagePreview = async (previewData, address, id) => {
  try {
  let filename = `user/${address}/canvases/${id}.png`;
  previewData = Buffer.from(previewData, "base64");
  console.log(previewData);
  let url = await uploadImageToS3(previewData, filename);
  let ipfs = await uploadMediaToIpfs(previewData);

  console.log(url, ipfs);

  canvasSchema.update(
    { imageLink: [url], ipfsLink: [ipfs] },
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
