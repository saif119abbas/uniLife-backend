const express = require("express");
const dotenv = require("dotenv").config();
const session = require("express-session");
const cookie_parser = require("cookie-parser");
const studentRouter = require("./router/studentRouter");
//dotenv.config();
const app = express();
app.use(express.json());
app.use(
  session({
    secret: "test-secret",
    resave: false,
    saveUninitialized: true,
  })
);
app.use("/api/v1/unilife", studentRouter);

//console.log(process.env.DATABASE_NAME);
module.exports = app;
