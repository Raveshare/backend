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

module.exports = router;
