const { validateMetadata } = require("../lens/api");

const { v4: uuid } = require("uuid");

const pinataSDK = require('@pinata/sdk');
const { Readable } = require("stream");

const pinata = new pinataSDK(process.env.PINATA_API_KEY , process.env.PINATA_API_SECRET);

const uploadMediaToIpfs = async (blob, mimeType) => {
  mimeType = mimeType || "image/png";

  let reader = new Readable();
  reader.push(blob);
  reader.push(null);

  let res = await pinata.pinFileToIPFS(reader , {
    pinataMetadata : {
      name : 'image',
    }
  })

  return res.IpfsHash;
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

  let res = await pinata.pinJSONToIPFS(metaData);

  return res.IpfsHash;
};

module.exports = {
  uploadMediaToIpfs,
  uploaddMetadataToIpfs,
};
