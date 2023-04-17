const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const contentRouter = require('./routes/content/contentRouter');

app.use(express.json());

app.use('/content', contentRouter);

app.listen(3000, () => {
    console.log('Server started on port 3000');
}
);