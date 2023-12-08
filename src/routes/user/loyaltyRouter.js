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
      name: true,
      description: true,
      amount: true,
      campaign: true,
    }
  });

  let taskStatus = []

  for(let i=0 ; i<tasks.length; i++){
    let history = await prisma.points_history.findMany({
      where: {
        ownerId: req.user.user_id,
        taskId: tasks[i].id,
      }
    })

    if(history.length > 0){
      taskStatus.push({
        ...tasks[i],
        completed: true,
      })
    } else {
      taskStatus.push({
        ...tasks[i],
        completed: false,
      })
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

  let response = [{"user_points":owner.points},...reward_history]

  res.send({
    message: response,
  });
});

module.exports = router;
