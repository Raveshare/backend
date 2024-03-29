const jsonwebtoken = require("jsonwebtoken");

/**
 * Generates JWT
 * @param {String} evm_address EVM Address of the user
 * @param {String} solana_address Solana Address of the user
 * @param {String} user_id Unique ID of the authenticated user
 * @returns 
 */

// if JWT is generated successfully, then cache the JWT for a day.
function generateJwt(evm_address, solana_address, user_id, fid) {
  return jsonwebtoken.sign(
    {
      evm_address,
      solana_address,
      user_id,
      fid,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "1d",
    }
  );
}

module.exports = generateJwt;
