const axios = require('axios');
const jwt = require('jsonwebtoken');

const checkAccessToken = require('../../lens/api').checkAccessToken;
const refreshToken = require('../../lens/api').refreshToken;

const auth = async (req, res, next) => {

    let accessToken = req.headers['Authorization'];
    accessToken = accessToken.split(" ")[1];


    if (accessToken) {
        let result = await checkAccessToken(accessToken);
        if (result) {
            next();
        } else {
            res.status(401).send("Invalid Token");
        }
    } else {
        res.status(401).send("Unauthorized");
    }
}

module.exports = auth;