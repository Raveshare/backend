const ethers = require('ethers');

/**
 * Verifies the signature of a user
 * @param {string} address
 * @param {string} signature
 * @param {string} message
 */
const verifySignature = async (address, signature , message) => {
    try {
    let recoveredAddress = await ethers.utils.verifyMessage(message, signature);
    } catch (err) {
        console.log(err);
        return false;
    }
    return recoveredAddress === address;
}

module.exports = verifySignature;