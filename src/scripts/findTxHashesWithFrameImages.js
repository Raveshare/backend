const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require("fs");

async function findTxHashesWithFrameImages() {
  // Fetch all frames to get their IDs and construct the URLs to search for
  console.log("Fetching frames...");
  const frames = await prisma.frames.findMany({
    select: {
      id: true,
    },
  });

  const frameUrls = frames.map(
    (frame) => `https://frames.lenspost.xyz/frame/${frame.id}`
  );

  // Find user_published_canvases where metadata contains any of the frameUrls
  const canvasesWithFrameImages = await prisma.user_published_canvases.findMany(
    {
      where: {
        OR: frameUrls.map((url) => ({
          metadata: {
            path: ["image"],
            array_contains: url,
          },
        })),
      },
      select: {
        txHash: true,
      },
    }
  );

  // Extract and return the txHash values
  let res = canvasesWithFrameImages.map((canvas) => canvas.txHash);
  fs.writeFileSync(
    "txHashesWithFrameImages.json",
    JSON.stringify(res, null, 2)
  );
}

const axios = require("axios");

async function getLikesAndRecasts(txHash) {
  try {
    const response = await axios.get(
      `https://api.neynar.com/v2/farcaster/cast?identifier=${txHash}&type=hash`,
      {
        headers: {
          accept: "application/json",
          api_key: process.env.NEYNAR_API_KEY,
        },
      }
    );

    if (response.status !== 200) {
      return;
    }

    const { likes, recasts } = response.data.cast.reactions;

    return {
      likes: likes.length,
      recasts: recasts.length,
    };
  } catch (error) {
    console.error("Error fetching likes and recasts:", error);
  }
}

async function getReactionsForAllTxHashes() {
  const txHashes = JSON.parse(
    fs.readFileSync("txHashesWithFrameImages.json", "utf8")
  );

  for (const txHash of txHashes) {
    try {
      const { likes, recasts } = await getLikesAndRecasts(txHash);
      if (likes === undefined || recasts === undefined) {
        continue;
      }
      let line = `${txHash},${likes},${recasts}`;
      console.log(line);
      fs.appendFileSync("likesAndRecasts.csv", line + "\n");
    } catch (error) {
      console.error(`Error fetching reactions for txHash ${txHash}:`, error);
    }
  }
}

module.exports = getReactionsForAllTxHashes;
