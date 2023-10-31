const userRouter = require('express').Router();
const nftRouter = require('./nftRouter');
const canvasRouter = require('./canvasRouter');
const uploadedRouter = require('./uploadedRouter');
const auth = require('../../middleware/auth/auth');

userRouter.use('/nft', nftRouter);
userRouter.use('/canvas', canvasRouter);
userRouter.use('/upload', uploadedRouter);

module.exports = userRouter;