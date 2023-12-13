const prisma = require("../../prisma");

// reduces the points of the user by 1
const completedProfile = async (ownerId) => {


  let hasAlreadyCompleted = await prisma.points_history.findFirst({
    where: {
      ownerId: ownerId,
      taskId: 5,
    },
  });

  if (hasAlreadyCompleted) return;
  console.log("completed profile");

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
      taskId: 5,
      ownerId: ownerId,
      reason: "User completed Profile",
      amount: 10,
    },
  });
};

module.exports = {
  completedProfile,
};
