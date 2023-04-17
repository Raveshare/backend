const db = require("./db")
const { content , collections} = require("../../schema/schema")

/**
 * Syncs the database
 * @returns {number} - returns 200 if successful, 500 if not
 */

async function sync() {
    try {
    await db.sync({ alter: true })
    return 200
    } catch (error) {
        console.log(error)
        return 500
    }
}

module.exports = sync