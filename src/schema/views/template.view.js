const { DataTypes } = require("sequelize");
const db = require("../../utils/db/db");

const template_view = db.define(
  "template_view",
  {
    data: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "template_view",
    timestamps: false,
  }
);

module.exports = template_view;