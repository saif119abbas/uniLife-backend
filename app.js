const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const session = require("express-session");
const studentRouter = require("./router/studentRouter");
const adminRouter = require("./router/adminRouter");
const restaurantRouter = require("./router/restaurantRouter");
const dormitoryRouter = require("./router/dormitoryRouter");
const userRouter = require("./router/userRouter");
const { initializeFirebaseApp } = require("./firebaseConfig");
const bodyParser = require("body-parser");
const { clear } = require("./utils/blackList");
const app = express();

app.use(express.json());

app.use(
  session({
    secret: process.env.SECRET_SESSION,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(bodyParser.json());
app.use(cors({ origin: "http://localhost:3001" }));
app.use(cookieParser(process.env.SECRETKEY));
app.use(process.env.BASE_URL, studentRouter);
app.use(process.env.BASE_URL, adminRouter);
app.use(process.env.BASE_URL, restaurantRouter);
app.use(process.env.BASE_URL, dormitoryRouter);
app.use(process.env.BASE_URL, userRouter);
initializeFirebaseApp();
module.exports = app;
