const axios = require("axios");
const canvasSchema = require("../schema/canvasSchema");

const WORKER_URL = process.env.WORKER_URL;
const WORKER_SECRET = process.env.WORKER_SECRET;
const getLatestImagePreview = async (canvasData, address, id) => {
  let data = {
    data: canvasData,
    address,
    id,
  };

  let url = `${WORKER_URL}/convert`;

  let config = {
    headers: {
      Authorization: `${WORKER_SECRET}`,
    },
  };

  try {
    let res = await axios.post(url, data, config);
    console.log(res.data);
    canvasSchema.update(
      { imageLink: res.data.url, ipfsLink: res.data.ipfs },
      {
        where: {
          id: id,
        },
      }
    );
    return res.data.ipfs;
  } catch (error) {
    console.log(error);
  }
};

module.exports = getLatestImagePreview;