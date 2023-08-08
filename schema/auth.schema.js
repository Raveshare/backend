const { DataTypes } = require("sequelize");
const db = require("../utils/db/db");

const auth = db.define("auth", {
  address: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  lens: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  farcaster: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  twitter: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
});

module.exports = auth