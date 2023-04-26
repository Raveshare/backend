const userRouter = require('express').Router();
const nftRouter = require('./nftRouter');
// const canvasRouter = require('./canvasRouter');
const meRouter = require('./meRouter');

userRouter.get('/', async (req, res) => {
    res.send("User Router");
});

userRouter.use('/nft', nftRouter);
userRouter.use('/me', meRouter);
// userRouter.use('/canvas', canvasRouter);

module.exports = userRouter;