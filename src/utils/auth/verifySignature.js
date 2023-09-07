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
    
    return recoveredAddress == address;

    } catch (err) {
        console.log(err);
        return false;
    }
}

module.exports = verifySignature;