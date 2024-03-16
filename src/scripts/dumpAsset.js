const fs = require("fs");
// const assetSchema = require('../schema/assetSchema');
const prisma = require("../prisma");
const axios = require("axios");

async function dumpAsset(name) {
  // name = "degen" + ".json";
  // let assets = fs.readFileSync("./src/dumpdata/assets/" + name);
  // assets = JSON.parse(assets);
  // // await assetSchema.bulkCreate(assets);
  // await prisma.assets.createMany({
  //   data: assets,
  //   skipDuplicates: true,
  // });
  // const data = await prisma.user_published_canvases.findMany({
  //   where: {
  //     platform: "farcaster",
  //   },
  // });
  // let totalLikes = 0;
  // let totalRecasts = 0;
  // let countedCasts = 0;
  // for (const canvas of data) {
  //   console.log(canvas.txHash);
  //   try {
  //     let response = await axios({
  //       method: "GET",
  //       url:
  //         "https://api.neynar.com/v2/farcaster/cast?identifier=" +
  //         canvas.txHash +
  //         "&type=hash",
  //       headers: {
  //         accept: "application/json",
  //         api_key: process.env.NEYNAR_API_KEY,
  //         "content-type": "application/json",
  //       },
  //     });
  //     if (response.data?.cast !== "") {
  //       const cast = response.data.cast;
  //       // Check if any embeds contain 'frame' in the URL
  //       const hasFrameInEmbeds = cast.embeds.some((embed) =>
  //         embed.url.includes("frame")
  //       );
  //       if (hasFrameInEmbeds) {
  //         console.log(cast);
  //         totalLikes += cast.reactions.likes.length;
  //         totalRecasts += cast.reactions.recasts.length;
  //         countedCasts++;
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error fetching data for canvas:", canvas.txHash, error);
  //   }
  // }
  // const stats = {
  //   totalLikes,
  //   totalRecasts,
  //   averageLikes: countedCasts > 0 ? totalLikes / countedCasts : 0,
  //   averageRecasts: countedCasts > 0 ? totalRecasts / countedCasts : 0,
  // };
  // console.log("Stats:", stats);
  // const uniqueCampaignNames = await prisma.assets.updateMany({
  //   where: {
  //     campaign: "monniverse",
  //   },
  //   data: {
  //     featured: true,
  //     tags: ["monniverse", "moon", "mermaid", "characters", "hair", "tail", "fish"],
  //   },
  // });
  // console.log(uniqueCampaignNames);

  const data = {
    items: [
      {
        wallet: "0x41A0Bd13CbC4281a07C72F1124dCC6655a3c5CFc",
        network: "ZORA",
        type: "CONTRACT",
      },
    ],
  };

  for (const item of data.items) {
    await prisma.wallet_whitelisted_registry.create({
      data: {
        wallet: item.wallet,
        network: item.network,
        type: item.type,
      },
    });
    console.log(`Added wallet ${item.wallet} to the database.`);
  }
}

module.exports = dumpAsset;
