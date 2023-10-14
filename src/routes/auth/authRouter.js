const authRouter = require("express").Router();
const evmRouter = require("./evmRouter");
const solanaRouter = require("./solanaRouter");

authRouter.use("/emv", evmRouter);
authRouter.use("/solana", solanaRouter);

module.exports = authRouter;
