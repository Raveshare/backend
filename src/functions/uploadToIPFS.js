const { validateMetadata } = require("../lens/api");

const polygonPrivateKey = process.env.POLYGON_PRIVATE_KEY;

const NodeBundlr = require("@bundlr-network/client");
const bundlr = new NodeBundlr(
  "http://node2.bundlr.network",
  "matic",
  polygonPrivateKey
);

const { v4: uuid } = require("uuid");

const uploadMediaToIpfs = async (blob, mimeType) => {
  mimeType = mimeType || "image/png";

  const tags = [{ name: "Content-Type", value: mimeType }];
  let { id } = await bundlr.upload(blob, {
    tags,
  });

  return `https://arweave.net/${id}`;
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

  // Upload to Arweave via Bundlr
  const { id } = await bundlr.upload(data, {
    tags: [{ name: "Content-Type", value: "application/json" }],
  });

  return `https://arweave.net/${id}`;
};

module.exports = {
  uploadMediaToIpfs,
  uploaddMetadataToIpfs,
};
