require("dotenv").config()
const { Sequelize } = require("sequelize")

// intialize the db object
const DATABASE_URI = "postgres://postgres:Aa@904493@localhost:5432/lenspost"
/**
 * Database object
 * @param DATABASE_URI URI of the POSTGRES Database
 */
const db = new Sequelize(DATABASE_URI)

module.exports = db

async function check() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}
