const mysql = require("mysql");
const AppError = require("./../utils/appError");
const configration = {
  host: "localhost",
  user: "root",
  password: "",
  database: "unilife",
};
exports.addDocument = (query, myData, next = null) => {
  let connection = mysql.createConnection(configration);
  connection.connect((error) => {
    if (error) {
      return next(AppError("Failed to connect to MySQL database!", 500));
    } else {
      console.log("Connected to MySQL database!");
    }
  });

  connection.query(query, myData, (error) => {
    if (error) {
      if (error.code === "ER_DUP_ENTRY")
        return next(new AppError("This document is already created", 401));
      return next(new AppError("Failed to connect to MySQL database!", 500));
    }
    // transportMessage(createMessage(), user.email);
    //we want to take the verficaion from user
    return next("");
  });
};
