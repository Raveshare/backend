const { DataTypes } = require("sequelize");
const db = require("../../utils/db/db");

const public_canvas = db.define(
  "public_canvas",
  {
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
    gatedWith: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    allowList: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
  },
  {
    tableName: "public_canvas_templates",
    timestamps: false,
  }
);

module.exports = public_canvas;
