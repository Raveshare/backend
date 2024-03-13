const axios = require("axios");

const handleAddRewards = async (id, evm_address, reason) => {
  console.log(id, evm_address, reason);
  try {
    const getPosterService = await axios.post(
      `${process.env.POSTER_SERVICE_URL}/reward/`,
      { id, evm_address, reason },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return `${getPosterService.data}, reason: ${reason}, id: ${id}, evm_address: ${evm_address}`;
  } catch (e) {
    return e.message;
  }
};

module.exports = {
  handleAddRewards,
};
