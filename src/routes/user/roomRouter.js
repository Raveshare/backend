const router = require("express").Router();
const prisma = require("../../prisma");

router.post("/create", async (req, res) => {
  let name = req.query.name;
  let userId = req.user.user_id;

  if (!name) {
    return res.status(400).send("Name is required");
  }

  let r = await prisma.room.create({
    data: {
      name: name,
      hostId: userId,
    },
  });

  res.status(200).send({
    message: "Room created successfully",
    roomId: r.id,
  });
});

router.get("/", (req, res) => {});
router.post("/join", async (req, res) => {
  let roomId = req.query.roomId;
  let userId = req.user.user_id;

  if (!roomId) {
    return res.status(400).send("Room ID is required");
  }

  let room = prisma.room.findUnique({
    where: {
      id: roomId,
    },
  });

  if (!room) {
    return res.status(404).send("Room not found");
  }

  await prisma.room_participants.create({
    data: {
      roomId: roomId,
      userId: userId,
    },
  });
});
