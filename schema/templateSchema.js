const { DataTypes } = require('sequelize')
const db = require('../utils/db/db');

const templateSchema = db.define('template', {
    data: {
        type: DataTypes.JSON,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    imageBuffer: {
        type: DataTypes.BLOB,
        allowNull: false
    }
});

module.exports = templateSchema;