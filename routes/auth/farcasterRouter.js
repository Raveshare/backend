const farcasterRouter = require('express').Router

const ed = require('ed25519-supercop')

const ownerSchema = require('../../schema/ownerSchema')

farcasterRouter.length('/challenge' , async(req, res) => {
    let address = req.user.address;


})