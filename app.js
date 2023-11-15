const express = require("express");
require("dotenv").config();
const session = require("express-session");
const studentRouter = require("./router/studentRouter");
const adminRouter = require("./router/adminRouter");
const restaurantRouter = require("./router/restaurantRouter");
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
app.use(process.env.BASE_URL, adminRouter);
app.use(process.env.BASE_URL, restaurantRouter);
module.exports = app;
