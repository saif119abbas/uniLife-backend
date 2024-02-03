const Sequelize = require("sequelize");
const databaseName = require("./databaseName");
const sequelize = new Sequelize(databaseName, "admin", "1234saiF", {
  host: "unilife-db.cs7ndlxwgkgc.us-east-1.rds.amazonaws.com",
  dialect: "mysql",
});
module.exports = sequelize;
