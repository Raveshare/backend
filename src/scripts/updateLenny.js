const { createPublicClient, http } = require("viem");
const { polygon } = require("viem/chains");
const LensHub = require("./LensHub.json");
const dotenv = require("dotenv");
const fs = require("fs");
dotenv.config();
const uploadImageToS3 = require("../functions/helper/uploadImageToS3");
const convertSVGToPng = require("../functions/helper/convertToPng");
const prisma = require("../prisma");

const getLenny = async (user_id, profileId, profileHandle) => {
  const alchemyUrl = `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
  const client = createPublicClient({
    chain: polygon,
    transport: http(alchemyUrl),
  });

  const data = await client.readContract({
    address: "0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d",
    abi: LensHub,
    functionName: "tokenURI",
    args: [profileId],
  });

  const jsonData = JSON.parse(
    Buffer.from(data.split(",")[1], "base64").toString()
  );

  const base64Image = jsonData.image.split(";base64,").pop();
  const svgImage = Buffer.from(base64Image, "base64").toString("utf-8");
  const pngImage = await convertSVGToPng(svgImage);
  let path = `user/${user_id}/nft/matic/${profileHandle}.png`;
  const uploadImage = await uploadImageToS3(pngImage, path);
  console.log(uploadImage);
  return uploadImage;
};

const updateLenny = async () => {
  const owners = await prisma.owners.findMany({
    where: {
      profileId: {
        not: null,
      },
    },
    select: {
      id: true,
      profileId: true,
      lens_handle: true,
      evm_address: true,
    },
  });

  for (const owner of owners) {
    const { id, profileId, lens_handle, evm_address } = owner;
    const profileIdInt = parseInt(profileId);
    const uploadImage = await getLenny(id, profileId, lens_handle);
    await prisma.nftData.create({
      data: {
        address: "0xdb46d1dc155634fbc732f92e853b10b288ad5a1d",
        tokenId: profileId,
        permaLink: `https://lens.xyz/${lens_handle}`,
        imageURL: uploadImage,
        ownerAddress: evm_address,
        ownerId: id,
        chainId: 137,
        title: lens_handle,
        description: `Lens Protocol - Profile #${profileIdInt}`,
        openseaLink: `https://opensea.io/assets/matic/0xdb46d1dc155634fbc732f92e853b10b288ad5a1d/${profileIdInt}`,
      },
    });
    console.log(`Updated ${lens_handle}`);
  }
};

updateLenny();
