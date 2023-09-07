require("dotenv").config()
const { Sequelize } = require("sequelize")

// intialize the db object
const DATABASE_URI = process.env.DATABASE_URI
/**
 * Database object
 * @param DATABASE_URI URI of the POSTGRES Database
 */
const db = new Sequelize(DATABASE_URI, {
    logging: false,

    pool: {
        max: 10,
        min: 0,
        idle: 10000
    }
})

module.exports = db

async function check() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}
