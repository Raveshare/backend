const authRouter = require("express").Router();
const evmRouter = require("./evmRouter");
const solanaRouter = require("./solanaRouter");
const farcasterRouter = require("./farcasterRouter");

authRouter.use("/evm", evmRouter);
authRouter.use("/solana", solanaRouter);
authRouter.use("/farcaster", farcasterRouter);

module.exports = authRouter;
