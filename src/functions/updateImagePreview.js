const uploadImageToS3 = require("./uploadImageToS3");
const { uploadMediaToIpfs } = require("./uploadToIPFS");
const purgeImageCache = require("./cache/purgeImageCache");
const prisma = require("../../src/prisma");

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

    await prisma.canvases.update({
      where: {
        id,
      },
      data: {
        imageLink: url,
        ipfsLink: ipfs,
      },
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = updateImagePreview;
