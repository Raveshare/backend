const { DataTypes } = require("sequelize")
const db = require("../utils/db/db")

/**
 * Schema for nftData
 * @returns {object} - returns the nftData schema
 */
const nftSchema = db.define('nftData', {
    tokenId: {
        type: DataTypes.INTEGER,
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