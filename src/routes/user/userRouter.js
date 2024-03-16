const userRouter = require("express").Router();
const nftRouter = require("./nftRouter");
const canvasRouter = require("./canvasRouter");
const uploadedRouter = require("./uploadedRouter");
const loyaltyRouter = require("./loyaltyRouter");
const prisma = require("../../prisma");

const { completedProfile } = require("../../functions/points/completeProfile");
const axios = require("axios");

userRouter.use("/nft", nftRouter);
userRouter.use("/canvas", canvasRouter);
userRouter.use("/upload", uploadedRouter);
userRouter.use("/loyalty", loyaltyRouter);

userRouter.post("/update", async (req, res) => {
  let user_id = req.user?.user_id;
  let { username, mailId } = req.body;

  try {
    if (username)
      await prisma.owners.update({
        where: {
          id: user_id,
        },
        data: {
          username,
        },
      });

    if (mailId)
      await prisma.owners.update({
        where: {
          id: user_id,
        },
        data: {
          mail: mailId,
        },
      });

    let user = await prisma.owners.findUnique({
      where: {
        id: user_id,
      },
      select: {
        username: true,
        mail: true,
      },
    });

    if (user.username && user.mail) await completedProfile(user_id);

    res.status(200).send({
      message: "Updated Successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Unique Constraint Violated",
    });
  }
});

userRouter.get("/", async (req, res) => {
  try {
    let user_id = req.user?.user_id;
  
    let poster = await axios.get(
      `${process.env.POSTER_SERVICE_URL}/reward/balance/${user_id}`
    );

    let user = await prisma.owners.findUnique({
      where: {
        id: user_id,
      },
      select: {
        username: true,
        mail: true,
        lens_handle: true,
        points: true,
      },
    });
    user.balance = poster.data.netAmount;

    res.send({
      message: user,
    });
  } catch (err) {
    console.log(err.message);
    res
      .status(500)
      .send({ status: "error", message: "Error fetching user details" });
  }
});

module.exports = userRouter;
