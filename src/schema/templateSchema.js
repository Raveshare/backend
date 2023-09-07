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
    image: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = templateSchema;