const { DataTypes } = require('sequelize');
const db = require('../utils/db/db');

// relations
const nftSchema = require('./nftSchema');
const canvasSchema = require('./canvasSchema');

const ownerSchema = db.define('owner', {
    address: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
    },
    canvasOwned : {
        type : DataTypes.INTEGER,
        defaultValue : 0
    },
    nftOwned : {
        type : DataTypes.INTEGER,
        defaultValue : 0
    },
    mail : {
        type : DataTypes.STRING,
        allowNull : true
    },
    lens_auth_token : {
        type: DataTypes.JSONB,
        allowNull: true
    },
    lens_handle : {
        type : DataTypes.STRING,
        allowNull : true
    },
});

// relations
ownerSchema.hasMany(nftSchema);
ownerSchema.hasMany(canvasSchema);
nftSchema.belongsTo(ownerSchema);
canvasSchema.belongsTo(ownerSchema);

module.exports = ownerSchema;