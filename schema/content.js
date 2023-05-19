const { DataTypes } = require("sequelize")
const db = require("../utils/db/db")

/**
 * Schema for content 
 * @returns {object} - returns the content schema
 */
const content = db.define('content',{
    tokenId : {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    title : {
        type: DataTypes.STRING,
        allowNull: false
    },
    description : {
        type: DataTypes.STRING,
        allowNull: false
    },
    edition : {
        type: DataTypes.STRING,
        allowNull: true
    },
    ipfsLink : {
        type: DataTypes.STRING,
        allowNull: false
    },
    imageURL : {
        type: DataTypes.STRING,
        allowNull: false
    },
    openseaLink : {
        type: DataTypes.STRING,
        allowNull: false
    },
})

module.exports = content