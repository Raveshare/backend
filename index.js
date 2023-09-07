const express = require("express");
const bree = require("./src/utils/scheduler/scheduler");
const dotenv = require("dotenv");
dotenv.config();
const app = express({
  logger: true,
});

(async () => {
  await bree.start();
})();

const compression = require('compression')

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");
const handleError = require("./src/middleware/error/error");
const auth = require("./src/middleware/auth/auth");

// include these 2 lines to sync the database
// const sync = require("./utils/db/sync")
// sync()


const NODE_ENV = process.env.NODE_ENV
console.log("NODE_ENV", NODE_ENV);

app.use(cors());
app.use(compression())
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});


//

const collectionRouter = require("./src/routes/content/collectionRouter");
const userRouter = require("./src/routes/user/userRouter");
const utilRouter = require("./src/routes/util/utilRouter");
const authRouter = require("./src/routes/auth/authRouter");
const templateRouter = require("./src/routes/content/templateRouter");
const assetRouter = require("./src/routes/content/assetRouter");

app.use(express.json({ limit: "20mb", extended: true }));
app.use(handleError);


app.use("/collection", auth, collectionRouter);
app.use("/user", userRouter);
app.use("/auth", authRouter);
app.use("/util", utilRouter);
app.use("/template", auth, templateRouter);
app.use("/asset", auth, assetRouter);

if(NODE_ENV === "local") {
  const adminRouter = require("./src/routes/admin/adminRouter");
  app.use("/admin", adminRouter);
}

app.listen(process.env.PORT || 3001, "0.0.0.0", () => {
  console.log(`Server started on port ${process.env.PORT || 3001}`);
});
