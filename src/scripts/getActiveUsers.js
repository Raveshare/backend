const prisma = require("../../src/prisma");
const fs = require("fs");
const path = require("path");

async function fetchUserIdsWhoCreatedCanvas() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentCanvases = await prisma.canvases.findMany({
    where: {
      createdAt: {
        gte: thirtyDaysAgo,
      },
    },
    select: {
      ownerId: true,
    },
  });

  // Extract unique ownerIds
  const userIds = [...new Set(recentCanvases.map((canvas) => canvas.ownerId))];

  userIds.sort((a, b) => a - b);

  return userIds;
}

async function saveUserIdsToFile(userIds) {
  const filePath = path.join(__dirname, "userIds.txt");
  fs.writeFileSync(filePath, JSON.stringify(userIds));
  console.log(`User IDs saved to ${filePath}`);
}

async function getActiveUsers() {
  try {
    console.log("fetching")
    const userIds = await fetchUserIdsWhoCreatedCanvas();
    await saveUserIdsToFile(userIds);
  } catch (error) {
    console.error("Error fetching user IDs:", error);
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = getActiveUsers;
