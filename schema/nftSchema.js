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
        type : DataTypes.TEXT(500),
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

//   {
//     "contractAddress": "0x6cF4328f1Ea83B5d592474F9fCDC714FAAfd1574",
//     "symbol": "FLSoc",
//     "tokenId": "200",
//     "name": "Fame Lady #200",
//     "description": "Fame Lady Society is the wrapped token for the first ever generative all-female avatar collection on the Ethereum blockchain. Yes, we are THE community who took over a project TWICE to write our own story. This is NFT history. This is HERstory. FLS are 8888 distinctive Ladies made up of millions of fierce trait combinations. Community = Everything. Commercial IP rights of each Lady NFT belong to its owner.",
//     "originalContent": {
//       "uri": "ipfs://bafybeifrehxmpmvh4hiywtpmuuuvt4lotol7wl7dnxlsxikfevn2ivvm7m/200.png",
//       "metaType": "image/png"
//     },
//     "chainId": 1
//   },

module.exports = nftSchema