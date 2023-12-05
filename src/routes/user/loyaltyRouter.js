const router = require("express").Router();
const prisma = require("../../prisma");

router.get("/invite-code", async (req, res) => {
  let user_id = req.user.user_id;

  let invite_code = await prisma.referral.findMany({
    where: {
      ownerId: user_id,
      hasClaimed: false,
    },
    select: {
      referralCode: true,
    },
  });

  invite_code = invite_code?.map((code) => code.referralCode);

  res.send({
    message: invite_code,
  });
});

router.get("/tasks", async (req, res) => {

  let tasks = await prisma.tasks.findMany({
    where : {
      locked: false,
    },
    select : {
      id: true,
      description: true,
      amount: true,
      campaign: true,
    }
  });

  res.send({
    message: tasks,
  });
});

router.get("/reward-history", async (req, res) => {

  let user_id = req.user.user_id;

  let owner = await prisma.owners.findUnique({
    where: {
      id: user_id,
    },
    select: {
      points: true,
    },
  });

  let reward_history = await prisma.points_history.findMany({
    where: {
      ownerId: user_id,
    },
    select: {
      taskId: true,
      reason: true,
      amount: true,
      createdAt: true,
    },
  });

  let response = [{"user_points":owner.points},...reward_history]

  res.send({
    message: response,
  });
});

module.exports = router;
