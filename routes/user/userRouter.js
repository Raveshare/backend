const userRouter = require('express').Router();
const nftRouter = require('./nftRouter');
const canvasRouter = require('./canvasRouter');
const auth = require('../../middleware/auth/auth');

userRouter.use('/nft', auth, nftRouter);
userRouter.use('/canvas',auth, canvasRouter);

module.exports = userRouter;