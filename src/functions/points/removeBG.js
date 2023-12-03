const prisma = require("../../prisma");

// reduces the points of the user by 1
const usedRemoveBG = async (ownerId) => {
  await prisma.owners.updateMany({
    where: {
      id: ownerId,
    },
    data: {
      points: {
        decrement: 1,
      },
    },
  });
  await prisma.points_history.create({
    data: {
      ownerId: ownerId,
      reason: "Used removed background feature",
      amount: -1,
    },
  });
};

// checks if the user has enough points to use the removeBG feature
const canUseRemoveBG = async (ownerId) => {
  let owner = await prisma.owners.findUnique({
    where: {
      id: ownerId,
    },
    select: {
      points: true,
    },
  });

  if (owner.points >= 1) {
    return true;
  } else {
    return false;
  }
};

module.exports = {
  usedRemoveBG,
  canUseRemoveBG,
};
