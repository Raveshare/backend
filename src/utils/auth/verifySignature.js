const ethers = require('ethers');
const { add } = require('lodash');


/**
 * Verifies the signature of a user for Ethereum
 * @param {string} address
 * @param {string} signature
 * @param {string} message
 */
const verifyEthSignature =  (address, signature , message) => {
    try {
    let recoveredAddress =  ethers.utils.verifyMessage(message, signature);
    
    return recoveredAddress == address;

    } catch (err) {
        console.log(err);
        return false;
    }
}

/**
 * Verifies the signature of a user for Solana
 * @param {string} address
 * @param {string} signature
 * @param {string} message
 */
const verifySolSignature = async (address, signature, message) => {
    try {
        if(await crypto.subtle.verify('Ed25519' , address, signature, message)) return true;
        else return false;
    } catch (err) {
        console.log(err);
        return false;
    }
}

module.exports = {
    verifyEthSignature,
    verifySolSignature
}