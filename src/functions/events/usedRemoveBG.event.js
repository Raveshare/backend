const posthogClient = require("../../utils/posthog/posthogClient.js");

const usedRemoveBG = (userId) => {
  try {
    posthogClient.capture({
      distinctId: userId,
      event: "User used remove bg feature",
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = usedRemoveBG;
