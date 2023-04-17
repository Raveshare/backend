const { DataTypes } = require("sequelize")
const db = require("../utils/db/db")
const content = require("./content")

const collections = db.define('collections',{
    address : {
        type: DataTypes.STRING,
        allowNull: false
    },
    name : {
        type: DataTypes.STRING,
        allowNull: false
    },
    openseaLink : {
        type: DataTypes.STRING,
        allowNull: false
    },
})
collections.hasMany(content)
content.belongsTo(collections)

module.exports = collections