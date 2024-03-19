const mixpanel = require("../../utils/mixpanel/mixpanel.js");

const userLogin = async (userId) => {
  try {
    mixpanel.track("User Logged In",{
      distinctId: userId,
    });
    mixpanel.people.set(userId, {
      $last_login: new Date(),
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = userLogin;
