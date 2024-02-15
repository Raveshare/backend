const prisma = require("../prisma");
const referral = require("voucher-code-generator");

const addTask = async () => {
  const task = await prisma.tasks.create({
    data: {
      description: "User logins to platform",
      amount: 10,
    },
  });

  console.log(task);
};

// write a script that will add 1 point to every user in the database
const addPoints = async () => {
  const owners = await prisma.owners.findMany({
    where: {
      id: {
        gte: 256,
      },
    },
  });

  await prisma.owners.updateMany({
    data: {
      points: 10,
    },
  });

  for (let owner of owners) {
    await prisma.points_history.create({
      data: {
        ownerId: owner.id,
        taskId: 199,
        reason: "User logins to platform",
        amount: 10,
      },
    });
  }

  console.log("Added points to all users");
};

let ref = referral.generate({
  length: 6,
  count: 256,
});

let count = 0;
const addReferralCode = async () => {
  const owners = await prisma.owners.findMany();
  console.log(owners.length);

  let refOwner = [];
  for (let owner of owners) {
    refOwner.push({
      ownerId: owner.id,
      referralCode: ref[count],
    });
    count++;
  }

  await prisma.referral.createMany({
    data: refOwner,
  });

  console.log("Added referral code to all users");
};

