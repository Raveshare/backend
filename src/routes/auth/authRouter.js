const authRouter = require("express").Router();
const evmRouter = require("./evmRouter");
const solanaRouter = require("./solanaRouter");
const evmRouter = require("./evmRouter");

authRouter.use("/evm", evmRouter);
authRouter.use("/solana", solanaRouter);

module.exports = authRouter;
