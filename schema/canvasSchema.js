const { DataTypes } = require('sequelize');
const db = require('../utils/db/db');

const canvasSchema = db.define('canvas', {
    data : {
        type : DataTypes.JSONB,
        allowNull : false
    },
    params : {
        type : DataTypes.JSONB,
        allowNull : false
    },
    isPublic : {
        type : DataTypes.BOOLEAN,
        allowNull : false,
        defaultValue : false
    },
    ipfsLink : {
        type : DataTypes.STRING,
        allowNull : true
    },
    imageLink : {
        type : DataTypes.STRING,
        allowNull : true
    }
});

module.exports = canvasSchema;