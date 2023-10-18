const mysql = require("mysql2");
const AppError = require("./../utils/appError");
const catchAsync = require("./catchAsync");

exports.connection = (query, result) => {
  /* let connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "unilife",
  });
  connection.connect((error) => {
    if (error) {
      return new AppError("Failed to connect to MySQL database!", 500);
    } else {
      console.log("Connected to MySQL database!");
    }
  });

  connection.query(query, (error, results, fields) => {
    if (error) {
      return console.error(error.message);
    }
    result = results;
    //console.log(results);
  });*/
};
// connect to the MySQL database
