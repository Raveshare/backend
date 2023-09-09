const { DataTypes } = require('sequelize');
const db = require('../utils/db/db');

const Asset = db.define('Asset', {
    tags : {
        type : DataTypes.ARRAY(DataTypes.STRING),
        allowNull : true
    },
    type : {
        type : DataTypes.STRING,
        allowNull : true
    },
    author : {
        type : DataTypes.STRING,
        allowNull : true
    },
    wallet : {
        type : DataTypes.STRING,
        allowNull : true
    },
    image : {
        type : DataTypes.STRING,
        allowNull : true
    },
    dimensions : {
        type : DataTypes.ARRAY(DataTypes.INTEGER),
        allowNull : true
    },
    featured : {
        type : DataTypes.BOOLEAN,
        allowNull : true
    },
});

module.exports = Asset;