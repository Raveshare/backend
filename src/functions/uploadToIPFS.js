const { validateMetadata } = require("../lens/api");

const { v4: uuid } = require("uuid");
const fs = require("fs");

const { ThirdwebStorage } = require("@thirdweb-dev/storage");

const storage = new ThirdwebStorage({
  secretKey: process.env.TW_SECRET_KEY,
});

const uploadMediaToIpfs = async (blob, mimeType) => {
  mimeType = mimeType || "image/png";

  let res = await storage.upload(blob, {
    uploadWithoutDirectory : true,
  });

  return res;
};

const uploaddMetadataToIpfs = async (postData) => {
  let media = [];
  for (let i = 0; i < postData.image.length; i++) {
    media.push({
      type: "image/png",
      item: `${postData.image[i]}`,
    });
  }

  const metaData = {
    version: "2.0.0",
    content:
      postData.content +
      "\n\n ~ 𝙈𝙖𝙙𝙚 𝙤𝙣 @lenspostxyz - 𝙔𝙤𝙪𝙧 𝙒𝙚𝙗3 𝙎𝙤𝙘𝙞𝙖𝙡 𝙎𝙩𝙪𝙙𝙞𝙤",
    description: postData.content,
    name: `Post by ${postData.handle}`,
    external_url: `https://lenstube.xyz/${postData.handle}`,
    image: `${postData.image[0]}`,
    imageMimeType: "image/png",
    metadata_id: uuid(),
    mainContentFocus: "IMAGE",
    attributes: [],
    locale: "en-US",
    media,
    appId: "lenspost",
  };

  const { valid, reason } = await validateMetadata(metaData);

  if (!valid) {
    throw new Error(reason);
  }

  const data = JSON.stringify(metaData);

  const upload = await storage.upload(data, {
    uploadWithoutDirectory : true,
  });

  return upload;
};

module.exports = {
  uploadMediaToIpfs,
  uploaddMetadataToIpfs,
};
