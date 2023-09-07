const jsonwebtoken = require("jsonwebtoken");

/**
 * Generates a JWT token
 * @param {string} address - the address of the user
 * @param {signature} signature - the signature of the user
 * @returns {string} - the JWT token
 */

function generateJwt(address, signature) {
    return jsonwebtoken.sign(
        {
            address,
            signature
        }
        , process.env.JWT_SECRET_KEY,
        {
            expiresIn: "1d"
        });
}

module.exports = generateJwt;