const jsonwebtoken = require("jsonwebtoken");

/**
 * Generates JWT
 * @param {String} evm_address EVM Address of the user
 * @param {String} solana_address Solana Address of the user
 * @param {String} user_id Unique ID of the authenticated user
 * @returns 
 */
function generateJwt(evm_address, solana_address, user_id) {
  return jsonwebtoken.sign(
    {
      evm_address,
      solana_address,
      user_id,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "1d",
    }
  );
}

module.exports = generateJwt;
