const { where } = require("sequelize");
const canvas = require("../schema/canvasSchema");
const fs = require("fs");

const dumpCanvas = async () => {
  let assets = fs.readFileSync("./src/dumpdata/" + "final.json");
  assets = JSON.parse(assets);

  for (let i = 0; i < assets.length; i++) {
    let id = assets[i].id;

    console.log(id);

    await canvas.update(
        assets[i],
        {
            where: {
                id: id,
            },
        }
    );

    console.log(`${i} done`)
  }

  console.log("done");
};

module.exports = dumpCanvas;
