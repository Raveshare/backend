const { validateMetadata } = require("../lens/api");
const { File } = require("@web-std/file");

const { Web3Storage } = require("web3.storage");

const client = new Web3Storage({
  token: process.env.WEB3_STORAGE_API_KEY,
});

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
};

const uploadMediaToIpfs = async (blob, mimeType) => {
  const ipfsClient = await getIpfsClient();
  const result = await ipfsClient.add(blob);

  return result.cid.toString();
};

const uploaddMetadataToIpfs = async (postData) => {
  let media = [];
  for (let i = 0; i < postData.image.length; i++) {
    media.push({
      type: "image/png",
      item: `ipfs://${postData.image[i]}`,
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

  const path = await client.put(
    [
      new File([JSON.stringify(metaData)], "metadata.json", {
        type: "application/json",
      }),
    ],
    {
      wrapWithDirectory: false,
    }
  );

  return path.toString();
};

module.exports = {
  uploadMediaToIpfs,
  uploaddMetadataToIpfs,
};
