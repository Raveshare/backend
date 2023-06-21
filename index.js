const express = require("express");
const app = express(
  {
    logger: true,
  },
);
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
const templateRouter = require("./routes/content/templateRouter");
const assetRouter = require("./routes/content/assetRouter");

app.use(express.json({limit: '2mb', extended: true}));
app.use(handleError);


app.use("/collection",auth, collectionRouter);
app.use("/user", userRouter);
app.use("/admin", adminRouter);
app.use("/auth", authRouter);
app.use("/util", utilRouter);
app.use("/template", auth,templateRouter);
app.use("/asset", auth , assetRouter);

app.listen(process.env.PORT || 3001, '0.0.0.0' , () => {
  console.log("Server started on port 3000");
});