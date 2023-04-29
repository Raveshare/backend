const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('./utils/db/db');
// include these 2 lines to sync the database

// const sync = require('./utils/db/sync');
// sync();


const contentRouter = require('./routes/content/contentRouter');
const userRouter = require('./routes/user/userRouter');
const utilRouter = require('./routes/util/utilRouter');

app.use(express.json());

app.use('/content', contentRouter);
app.use('/user', userRouter);
app.use('/util', utilRouter);

app.listen(process.env.PORT || 3000, '0.0.0.0' , () => {
    console.log("Server started");
});