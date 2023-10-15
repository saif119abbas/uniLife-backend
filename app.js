const express = require("express");
const dotenv = require("dotenv").config();
const studentRouter = require("./router/studentRouter");
//dotenv.config();
const app = express();
app.use(express.json());
app.use("/api/v1/unilife", studentRouter);
console.log(process.env.DATABASE_NAME);
/*let hash1 = "",
  hash2 = "";
bcrypt.hash("55555", 12, (err, hash) => {
  if (err) return new AppError("An error occured please try again ");
  hash1 = hash;
  console.log("hash1:", hash1);
});
bcrypt.hash("123456", 12, (err, hash) => {
  if (err) return new AppError("An error occured please try again ");
  hash2 = hash;
  console.log("hash2:", hash2);
});*/
module.exports = app;
