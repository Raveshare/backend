/**
 * A middleware to handle errors
 * @param {object} err - the error object
 * @param {object} req - the request object
 * @param {object} res - the response object
 * @param {function} next - the next function
 * @returns {object} - the response object
 */

function handleError(err, req, res, next) {
    console.log(err);
    res.status(500).send({
        "status": "error",
        "message": "Internal Server Error"
    });
}

module.exports = handleError;