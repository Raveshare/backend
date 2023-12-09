const prisma = require("../../prisma");

const canInvite = async (ownerId) => {
  let owner = await prisma.owners.findUnique({
    where: {
      id: ownerId,
    },
    select: {
      points: true,
    },
  });

  if (owner.points >= 5) {
    return true;
  } else {
    return false;
  }
};

const usedInvite = async (ownerId) => {
  await prisma.owners.updateMany({
    where: {
      id: ownerId,
    },
    data: {
      points: {
        decrement: 5,
      },
    },
  });
  await prisma.points_history.create({
    data: {
      ownerId: ownerId,
      reason: "Used generated invite code",
      amount: -5,
    },
  });
};

// reduces the points of the user by 1
const invitedUser = async (ownerId) => {

  let hasAlreadyInvited = await prisma.referral.findFirst({
    where: {
      ownerId: ownerId,
      hasClaimed: true,
    },
  });

  if (hasAlreadyInvited) return;

  await prisma.owners.updateMany({
    where: {
      id: ownerId,
    },
    data: {
      points: {
        increment: 10,
      },
    },
  });

  await prisma.points_history.create({
    data: {
      taskId: 7,
      ownerId: ownerId,
      reason: "User invited a friend",
      amount: 10,
    },
  });
};

module.exports = {
    invitedUser,
    canInvite,
    usedInvite,
};
