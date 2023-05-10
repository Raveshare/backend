const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");
const handleError = require("./middleware/error/error");
const auth = require('./middleware/auth/auth');


// include these 2 lines to sync the database

// const sync = require('./utils/db/sync');
// sync();

app.use(cors());
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

// 

const collectionRouter = require("./routes/content/collectionRouter");
const userRouter = require("./routes/user/userRouter");
const utilRouter = require("./routes/util/utilRouter");
const adminRouter = require("./routes/admin/adminRouter");
const authRouter = require("./routes/auth/authRouter");

app.use(express.json());
app.use(handleError);


app.use("/collection",auth, collectionRouter);
app.use("/user", userRouter);
app.use("/admin", adminRouter);
app.use("/auth", authRouter);

app.listen(process.env.PORT || 3001, '0.0.0.0' , () => {
  console.log("Server started on port 3000");
});