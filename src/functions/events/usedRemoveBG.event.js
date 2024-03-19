const mixpanelClient = require("../../utils/mixpanel/mixpanel.js");

const usedRemoveBG = (userId) => {
  try {
    mixpanelClient.track("User used remove bg feature", {
      distinct_id: userId,
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = usedRemoveBG;
