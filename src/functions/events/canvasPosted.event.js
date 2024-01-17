const prisma = require("../../prisma");

const canvasPosted = async (
  canvasId,
  userId,
  platform,
  xChain,
  scheduledAt,
  txHash,
  metadata
) => {
  try {
    await prisma.user_published_canvases.create({
      data: {
        canvasId,
        ownerId: userId,
        platform,
        xChain,
        scheduledAt,
        txHash,
        metadata,
      },
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = canvasPosted;
