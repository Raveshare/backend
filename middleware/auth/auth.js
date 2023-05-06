const jsonwebtoken = require("jsonwebtoken");

/**
 * Authenticating middleware
 * @param {object} req - the request object
 * @param {object} res - the response object
 * @param {function} next - the next function
 */

function authenticate(req, res, next) {
    if (!req.headers.authorization) {
        return res.status(401).send({
            "status": "error",
            "message": "Unauthorized"
        });
    }
    let token = req.headers.authorization.split(" ")[1];
    let decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET_KEY);
    if (!decoded) {
        return res.status(401).send({
            "status": "error",
            "message": "Unauthorized"
        });
    }
    req.user = decoded;
    next();
}

module.exports = authenticate;