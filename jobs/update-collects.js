const canvasSchema = require("../schema/canvasSchema");
const updateCollectsForPublication = require("../functions/updateCollectsForPublication");
const updateNFTOwnerForPublication = require("../functions/updateNFTOwnerForPublication");

const updateCollects = async (job, done) => {
  try {
    let canvas = await canvasSchema.findAll({
      where: {
        isPublic: true,
        isGated: true,
      },
      attributes: ["gatedWith", "id"],
    });

    for (let i = 0; i < canvas.length; i++) {
      let canvasId = canvas[i].id;
      for (let j = 0; j < canvas[i].gatedWith.length; j++) {
        let gatedWith = canvas[i].gatedWith[j];

        if (gatedWith.includes("-")) {
          updateCollectsForPublication(gatedWith, canvasId);
        } else {
          updateNFTOwnerForPublication(gatedWith, canvasId);
        }
      }
    }
  } catch (error) {
    console.log("error", error);
  }
};

updateCollects();
