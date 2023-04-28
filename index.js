const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

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

app.listen(3000, () => {
    console.log('Server started on port 3000');
}
);  