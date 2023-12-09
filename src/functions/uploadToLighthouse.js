const lighthouse = require("@lighthouse-web3/sdk");
const { validateMetadata } = require("../lens/api-v2");
const { v4: uuid } = require("uuid");

const LIGHTHOUSE_API_KEY = process.env.LIGHTHOUSE_API_KEY;

const uploadMediaToIpfs = async (blob, mimeType) => {
  const result = await lighthouse.uploadBuffer(blob, LIGHTHOUSE_API_KEY);

  console.log(result.data);

  return result.data.Hash;
};

const uploadMetadataToIpfs = async (postData) => {
  try {
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
      description: postData.content
        ? postData.content +
          "\n\n ~ 𝙈𝙖𝙙𝙚 𝙤𝙣 @lens/lenspostxyz  - 𝙔𝙤𝙪𝙧 𝙒𝙚𝙗3 𝙎𝙤𝙘𝙞𝙖𝙡 𝙎𝙩𝙪𝙙𝙞𝙤"
        : "~ 𝙈𝙖𝙙𝙚 𝙤𝙣 @lenspostxyz - 𝙔𝙤𝙪𝙧 𝙒𝙚𝙗3 𝙎𝙤𝙘𝙞𝙖𝙡 𝙎𝙩𝙪𝙙𝙞𝙤",
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
        content: postData.content
          ? postData.content +
            "\n\n ~ 𝙈𝙖𝙙𝙚 𝙤𝙣 @lens/lenspostxyz  - 𝙔𝙤𝙪𝙧 𝙒𝙚𝙗3 𝙎𝙤𝙘𝙞𝙖𝙡 𝙎𝙩𝙪𝙙𝙞𝙤"
          : "~ 𝙈𝙖𝙙𝙚 𝙤𝙣 @lenspostxyz - 𝙔𝙤𝙪𝙧 𝙒𝙚𝙗3 𝙎𝙤𝙘𝙞𝙖𝙡 𝙎𝙩𝙪𝙙𝙞𝙤",
        attachments: media,
      },
    };

    const { valid, reason } = await validateMetadata(JSON.stringify(metadata));

    if (!valid) {
      throw new Error(reason);
    }

    let { data } = await lighthouse.uploadText(
      JSON.stringify(metadata),
      LIGHTHOUSE_API_KEY
    );
    let path = data.Hash;
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

module.exports = { uploadMediaToIpfs , uploadMetadataToIpfs};
