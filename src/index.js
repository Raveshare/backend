const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const app = express({
  logger: true,
});

const compression = require("compression");
const logger = require("./middleware/log");
logger();

const cors = require("cors");
const auth = require("./middleware/auth/auth");

const NODE_ENV = process.env.NODE_ENV;
console.log("NODE_ENV", NODE_ENV);

app.use(cors());
app.use(compression());
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

const collectionRouter = require("./routes/content/collectionRouter");
const userRouter = require("./routes/user/userRouter");
const utilRouter = require("./routes/util/utilRouter");
const authRouter = require("./routes/auth/authRouter");
const templateRouter = require("./routes/content/templateRouter");
const assetRouter = require("./routes/content/assetRouter");
const publicRouter = require("./routes/public/publicRouter");
const fundRouter = require("./routes/util/fundRouter");

app.use(express.json({ limit: "30mb", extended: true }));

app.use("/collection", auth, collectionRouter);
app.use("/user", auth, userRouter);
app.use("/auth", authRouter);
app.use("/util", utilRouter);
app.use("/template", auth, templateRouter);
app.use("/asset", auth, assetRouter);
app.use("/public", publicRouter);
app.use("/mint", fundRouter);

if (NODE_ENV === "local") {
  const adminRouter = require("./routes/admin/adminRouter");
  app.use("/admin", adminRouter);
}

app.listen(process.env.PORT || 3001, "0.0.0.0", () => {
  console.log(`Server started on port ${process.env.PORT || 3001}`);
});
