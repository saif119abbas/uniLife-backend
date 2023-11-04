const express = require("express");
const dotenv = require("dotenv").config();
const session = require("express-session");
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
app.use(process.env.BASE_URL, studentRouter);
module.exports = app;
