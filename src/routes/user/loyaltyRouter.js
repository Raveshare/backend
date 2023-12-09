const router = require("express").Router();
const prisma = require("../../prisma");
const referral = require("voucher-code-generator");
const { canInvite, usedInvite } = require("../../functions/points/inviteUser");

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

router.post("/generate-code", async (req, res) => {
  let user_id = req.user.user_id;

  let canInviteUser = await canInvite(user_id);

  if (!canInviteUser) {
    return res.send({
      message: "Not enough points :(",
    });
  }

  let ref = referral.generate({
    length: 1,
    count: 256,
  });

  await prisma.referral.create({
    data: {
      ownerId: user_id,
      referralCode: ref[0],
    },
  });

  await usedInvite(user_id);

  res.send({
    message: ref[0],
  });
});

router.get("/tasks", async (req, res) => {
  let tasks = await prisma.tasks.findMany({
    where: {
      locked: false,
    },
    select: {
      id: true,
      name: true,
      tag: true,
      description: true,
      amount: true,
      campaign: true,
    },
  });

  let taskStatus = [];

  for (let i = 0; i < tasks.length; i++) {
    let history = await prisma.points_history.findMany({
      where: {
        ownerId: req.user.user_id,
        taskId: tasks[i].id,
      },
    });

    if (history.length > 0) {
      taskStatus.push({
        ...tasks[i],
        completed: true,
      });
    } else {
      taskStatus.push({
        ...tasks[i],
        completed: false,
      });
    }
  }

  res.send({
    message: taskStatus,
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

  let response = [{ user_points: owner.points }, ...reward_history];

  res.send({
    message: response,
  });
});

router.post('/claim-reward', async (req, res) => {
  let { taskId } = req.body;
  let user_id = req.user.user_id;

  let task = await prisma.tasks.findUnique({
    where: {
      id: taskId,
    },
  });

  if (!task) {
    return res.send({
      message: "Invalid task",
    });
  }

  let history = await prisma.points_history.findMany({
    where: {
      ownerId: user_id,
      taskId: taskId,
    },
  });

  if (history.length > 0) {
    return res.send({
      message: "Task already completed",
    });
  }

  await prisma.owners.update({
    where: {
      id: user_id,
    },
    data: {
      points: {
        increment: task.amount,
      },
    },
  });

  await prisma.points_history.create({
    data: {
      ownerId: user_id,
      taskId: taskId,
      reason: task.name,
      amount: task.amount,
    },
  });

  res.send({
    message: "Points claimed",
  });
});

module.exports = router;
