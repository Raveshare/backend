const { default: axios } = require("axios");
const prisma = require("../../prisma");

const uploadToFarcaster = async (postMetadata, ownerData) => {
  console.log(ownerData);
  let { image, content } = postMetadata;
  // [] --> [{url: "https://example.com/image.png"}]
  let embeds = image.map((url) => ({ url }));

  let signer_uuid = ownerData.farcaster_signer_uuid;

  if (!signer_uuid) {
    return {
      error: "No signer_uuid found",
      status: 500,
    };
  }
  try {

    content = content + "\n\n ~ 𝙈𝙖𝙙𝙚 𝙤𝙣 @lenspost  - 𝙔𝙤𝙪𝙧 𝙒𝙚𝙗3 𝙎𝙤𝙘𝙞𝙖𝙡 𝙎𝙩𝙪𝙙𝙞𝙤"

    const response = await axios({
      method: "POST",
      url: "https://api.neynar.com/v2/farcaster/cast",
      headers: {
        accept: "application/json",
        api_key: process.env.NEYNAR_API_KEY,
        "content-type": "application/json",
      },
      data: {
        signer_uuid,
        text: content,
        embeds,
      },
    });

    return {
      status: response.status === 200 ? 200 : 500,
      txHash: response.data?.cast?.hash,
      error: response.data?.message,
    };
  } catch (error) {
    return {
      error: error,
      status: 500,
    };
  }
};

module.exports = uploadToFarcaster;
