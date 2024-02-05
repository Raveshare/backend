const cron = require("node-cron");

const trendingMints = require("../../scripts/trendingMints");
const trendingMintsLenspost = require("../../scripts/trendingMintsLenspost");

const {
  getCache,
  setCache,
  deleteCache,
  setCacheWithExpire,
} = require("../../../src/functions/cache/handleCache.js");

cron.schedule("0 * * * *", async () => {
  console.log("Cron Job for Global Trending Mints is working");
  const cache = await getCache("trendingMints");
  await deleteCache("trendingMints");
  const trendingMintsData = await trendingMints();
  await setCacheWithExpire(
    "trendingMints",
    JSON.stringify(trendingMintsData),
    3600
  );
});

cron.schedule("0 * * * *", async () => {
  console.log("Cron Job for Global Trending Mints is working");
  const cache = await getCache("trendingMintsLenspost");
  await deleteCache("trendingMintsLenspost");
  const trendingMintsData = await trendingMintsLenspost();
  await setCacheWithExpire(
    "trendingMintsLenspost",
    JSON.stringify(trendingMintsData.data),
    3600
  );
});
