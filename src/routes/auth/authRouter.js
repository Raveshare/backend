const authRouter = require("express").Router();
const solanaRouter = require("./solanaRouter");
const evmRouter = require("./evmRouter");

authRouter.use("/solana", solanaRouter);
authRouter.use("/evm", evmRouter);

module.exports = authRouter;