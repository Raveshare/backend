const cron = require("node-cron");

const trendingMints = require("../../scripts/trendingMints");
const trendingMintsLenspost = require("../../scripts/trendingMintsLenspost");

const {
  getCache,
  setCache,
  deleteCache,
} = require("../../../src/functions/cache/handleCache.js");

cron.schedule("0 * * * *", async () => {
  const cache = await getCache("trendingMints");
  await deleteCache("trendingMints");
  const trendingMintsData = await trendingMints();
  await setCache("trendingMints", trendingMintsData);
});

cron.schedule("0 * * * *", async () => {
  const cache = await getCache("trendingMintsLenspost");
  await deleteCache("trendingMintsLenspost");
  const trendingMintsData = await trendingMintsLenspost();
  await setCache("trendingMintsLenspost", trendingMintsData);
});
