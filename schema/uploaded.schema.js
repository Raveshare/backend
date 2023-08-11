const { DataTypes } = require("sequelize");
const db = require("../utils/db/db");

const uploadedSchema = db.define("uploaded", {
  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = uploadedSchema;