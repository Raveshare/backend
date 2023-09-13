const content = require("./content")
const collections = require("./collections")
const nftSchema = require("./nftSchema")
const ownerSchema = require("./ownerSchema")
const canvasSchema = require("./canvasSchema")
const templateSchema = require("./templateSchema")  
const assetSchema = require("./assetSchema")
const auth = require('./auth.schema')
const uploadedSchema = require('./uploaded.schema')

module.exports = {
    content,
    collections,
    nftSchema,
    ownerSchema,
    canvasSchema,
    templateSchema,
    assetSchema,
    uploadedSchema,
    auth
}