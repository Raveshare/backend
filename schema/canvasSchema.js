const { DataTypes } = require("sequelize");
const db = require("../utils/db/db");

const canvasSchema = db.define("canvas", {
  data: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
  params: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  ipfsLink: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
  },
  imageLink: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
  },
  referredFrom: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  isGated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  allowList: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
});

canvasSchema.addHook("afterCreate", async (canvas, options) => {
  let referredFrom = canvas.referredFrom;

  for (let i = 0; i < referredFrom.length; i++) {
    let referredAddress = await canvasSchema.findOne({
      where: {
        id: referredFrom[i],
      },
    });
    if(!referredAddress) {
        referredFrom[i] = null;
        continue;
    }
    referredFrom[i] = referredAddress.dataValues.ownerAddress;
  }

  canvas.referredFrom = referredFrom;
  return canvas.save();
});

module.exports = canvasSchema;
