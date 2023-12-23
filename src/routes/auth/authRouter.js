const authRouter = require("express").Router();
const evmRouter = require("./evmRouter");
const solanaRouter = require("./solanaRouter");

authRouter.use("/evm", evmRouter);
authRouter.use("/solana", solanaRouter);

module.exports = authRouter;
