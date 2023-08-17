const userRouter = require('express').Router();
const nftRouter = require('./nftRouter');
const canvasRouter = require('./canvasRouter');
const uploadedRouter = require('./uploadedRouter');
const auth = require('../../middleware/auth/auth');

userRouter.use('/nft', auth, nftRouter);
userRouter.use('/canvas',auth, canvasRouter);
userRouter.use('/upload',auth, uploadedRouter);

module.exports = userRouter;