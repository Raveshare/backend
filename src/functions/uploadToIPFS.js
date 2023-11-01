const { validateMetadata } = require("../lens/api-v2");

const projectId = process.env.IPFS_PROJECT_ID;
const projectSecret = process.env.IPFS_PROJECT_SECRET;
const auth =
    "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");
const { v4: uuid } = require("uuid");

const getIpfsClient = async () => {
  const { create } = await import("ipfs-http-client");

  const ipfsClient = create({
      host: "ipfs.infura.io",
      port: 5001,
      protocol: "https",
      headers: {
          authorization: auth,
      },
  });

  return ipfsClient;
}

const uploadMediaToIpfs = async (blob, mimeType) => {
  mimeType = mimeType || "image/png";

  const ipfsClient = await getIpfsClient();
  const result = await ipfsClient.add(blob);
  
  return result.cid.toString();
};

const uploaddMetadataToIpfs = async (postData) => {

  const ipfsClient = await getIpfsClient();

  let media = [];
  for (let i = 0; i < postData.image.length; i++) {
    media.push({
      type: "image/png",
      item: `${postData.image[i]}`,
      item: postData.image[i]?.startsWith("https://arweave.net")
        ? postData.image[i]
        : `ipfs://${postData.image[i]}`,
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
    image: postData.image[0].startsWith("https://arweave.net") ? postData.image[0] : `ipfs://${postData.image[0]}`,
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
  const { path } = await ipfsClient.add(JSON.stringify(metaData));

  return path.toString();
};

module.exports = {
  uploadMediaToIpfs,
  uploaddMetadataToIpfs,
};
