const { default: axios } = require("axios");
const prisma = require("../../prisma");

const uploadToFarcaster = async (postMetadata, ownerData) => {
  let signer_uuid;

  const { msgText } = req.body;
  const { user_id } = ownerData;
  text = data.text;
  let { image } = postMetadata;
  let imageArray = image.map((uid) => ({ uid }));

  try {
    let ownerData = await prisma.owners.findUnique({
      where: {
        id: user_id,
      },
    });
    // console.log(ownerData);
    signer_uuid = ownerData.farcaster_signer_uuid;
    if (!signer_uuid) {
      return "No signer found with this user_id, please register one";
    }
  } catch (error) {
    return "No owner found with this user_id";
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
        text: msgText,
        embeds: imageArray,
      },
    });

    return response.data;
  } catch (error) {
    return error.message;
  }
};

module.exports = uploadToFarcaster;
