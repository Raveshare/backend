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
};

const uploadMediaToIpfs = async (blob, mimeType) => {
  mimeType = mimeType || "image/png";

  const ipfsClient = await getIpfsClient();
  const result = await ipfsClient.add(blob);

  return result.cid.toString();
};

const uploaddMetadataToIpfs = async (postData) => {
  try {
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

    const metadata = {
      description: postData.content,
      external_url: `https://hey.xyz/u/${postData.handle}`,
      name: `Post by ${postData.handle}`,
      $schema: "https://json-schemas.lens.dev/publications/image/3.0.0.json",
      lens: {
        id: uuid(),
        appId: "Lenspost",
        locale: "en",
        mainContentFocus: "IMAGE",
        image: {
          item: postData.image[0].startsWith("https://arweave.net")
            ? postData.image[0]
            : `ipfs://${postData.image[0]}`,
          type: "image/png",
        },
        title: `Post by ${postData.handle}`,
        content: postData.content,
        attachments: media,
      },
    };

    const { valid, reason } = await validateMetadata(JSON.stringify(metadata));

    if (!valid) {
      throw new Error(reason);
    }
    const { path } = await ipfsClient.add(JSON.stringify(metadata));

    return {
      status: 200,
      message: path,
    };
  } catch (e) {
    console.log(e);
    return {
      status: 500,
      message: e,
    };
  }
};

module.exports = {
  uploadMediaToIpfs,
  uploaddMetadataToIpfs,
};
