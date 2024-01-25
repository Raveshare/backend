const prisma = require("../prisma");
const { checkInviteLeft, inviteProfile } = require("../../src/lens/api-v2");

async function sendInvite(req, res) {
  let handle = "lens/lenspostxyz";
  const invite = req.query.invite;

  let data = await prisma.owners.findUnique({
    where: {
      id: 26,
      lens_handle: "lenspostxyz",
    },
  });
  data = data;

  let invitesLeft = await checkInviteLeft(handle);

  console.log(invitesLeft);

  if (invitesLeft > 0) {
    const response = await inviteProfile(
      data.accessToken,
      data.refreshToken,
      data.evm_address,
      data.id,
      invite
    );

    res.status(200).send({
      status: "success",
      data: response,
    });
    return;
  } else {
    res.status(400).send({
      status: "error",
      message: "No invites left",
    });
    return;
  }
}

module.exports = sendInvite;
