const { DataTypes } = require("sequelize")
const db = require("../utils/db/db")

/**
 * Schema for nftData
 * @returns {object} - returns the nftData schema
 */
const nftSchema = db.define('nftData', {
    tokenId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    openseaLink: {
        type: DataTypes.STRING,
        allowNull: false
    },
    dimensions: {
        type : DataTypes.ARRAY(DataTypes.INTEGER),
        allowNull : true
    },
    imageURL : {
        type : DataTypes.STRING,
        allowNull : true
    },
    permaLink : {
        type : DataTypes.STRING,
        allowNull : true
    },
    isPublic: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false
    },
})

module.exports = nftSchema