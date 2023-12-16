const { default: axios } = require("axios");
const prisma = require("../../prisma");

const uploadToFarcaster = async (postMetadata, ownerData) => {
  console.log(ownerData)
  let { image, content } = postMetadata;
  // [] --> [{url: "https://example.com/image.png"}]
  let embeds = image.map((url) => ({ url }));

  console.log("embeds", embeds);

  let signer_uuid = ownerData.farcaster_signer_uuid;

  console.log("signer_uuid", signer_uuid);

  if (!signer_uuid) {
    return {
      error: "No signer_uuid found",
      status: 500,
    };
  }
  try {
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
      error : response.data?.message
    }
  } catch (error) {
    return {
      error: error,
      status: 500,
    }
  }
};

module.exports = uploadToFarcaster;
