const { Sequelize } = require("sequelize");

// Set up Sequelize with MySQL
const sequelize = new Sequelize(process.env.MYSQL_DB, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
  host: process.env.MYSQL_HOST || "localhost",
  dialect: "mysql",
  logging: false, // Disable SQL query logs
});

module.exports = sequelize;
