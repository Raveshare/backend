const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");

// include these 2 lines to sync the database

const sync = require('./utils/db/sync');
sync();

app.use(cors());
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
const adminRouter = require("./routes/admin/adminRouter");

app.use(express.json());

app.use("/collection", collectionRouter);
app.use("/user", userRouter);
app.use("/util", utilRouter);
app.use("/admin", adminRouter);

app.listen(process.env.PORT || 3000, '0.0.0.0' , () => {
  console.log("Server started on port 3000");
});