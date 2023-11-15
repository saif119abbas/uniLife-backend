const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const catchAsync = require("./../utils/catchAsync");
const { createMessage, transportMessage } = require("./../utils/email");
const { createSendToken } = require("./../utils/createToken");

const AppError = require("./../utils/appError");
const { student, user } = require("../models");
let verifyMessage = "";
let expiresIn = "24h";

exports.login = catchAsync(async (req, res, next) => {
  const data = req.body;
  await user
    .findOne({ where: { email: data.email } })
    .then((result) => {
      if (result.length > 1)
        return res.status(403).json({
          status: "failed",
          message: "not allowed",
        });
      console.log(result);
      bcrypt.compare(
        data.password,
        result.password,
        (err, passwordIsCorrect) => {
          if (err) {
            return next(
              new AppError("An error occurred, please try again", 500)
            );
          }

          if (
            !passwordIsCorrect ||
            result?.email !== data.email ||
            result.length === 0
          ) {
            return res.status(401).json({
              status: "failed",
              message: "Incorrect email or password",
            });
          }

          // Authentication is successful, set session data and send the token
          else {
            req.session.email = data.email;
            req.session.userId = result.id;
            req.session.role = result.role;
            expiresIn = `${24 * 60 * 60}s`;
            data.id = result.id;
            createSendToken(data, 200, expiresIn, res);
          }
        }
      );
    })
    .catch((err) => {
      console.log("error:", err.message);
      return res.status(401).json({
        status: "failed",
        message: "Incorrect email or password",
      });
    });
});

exports.signup = catchAsync(async (req, res, next) => {
  const createdUser = req.body;
  if (
    !createdUser.email ||
    !createdUser.password ||
    !createdUser.phoneNum ||
    !createdUser.username ||
    !createdUser.confirmPassword
  )
    res.status(400).json({
      status: "failed",
      message: "Please provide your information",
    });
  if (createdUser.confirmPassword !== createdUser.password)
    return res.status(400).json({
      status: "falied",
      message: "password and confirm password not matched",
    });
  console.log("In signup");
  const userFound = await user.findOne({ where: { email: createdUser.email } });
  if (userFound)
    return res.status(401).json({
      status: "falied",
      message: "This account is already creted",
    });
  bcrypt.hash(createdUser.password, 12, (err, hash) => {
    if (err) {
      return new AppError("An error occured please try again ", 500);
    }

    req.session.email = createdUser.email;
    req.session.password = hash;
    req.session.phoneNum = createdUser.phoneNum;
    req.session.username = createdUser.username;

    verifyMessage = createMessage();
    transportMessage(verifyMessage, createdUser.email);
    stratTime = Date.now();
    expiredIn = 60;
    res.status(200).json({
      status: "success",
    });
  });
});

exports.verify = catchAsync(async (req, res, next) => {
  console.log("verify");
  if (!req.body)
    res.status(400).json({
      status: "failed",
      message:
        "You need to provide the verfication code to verify your account",
    });

  if (req.body.verifyCode === verifyMessage) {
    verifyMessage = "";
    //expiresIn = "24h";
    console.log(req.session.email, req.session.password, req.session.phoneNum);
    const myData = {
      email: req.session.email,
      password: req.session.password,
      phoneNum: req.session.phoneNum,
      username: req.session.username,
      role: process.env.student,
    };
    await user
      .create(myData)
      .then((data) => {
        student
          .create({ userId: data.id })
          .then((data) => {
            req.session.userId = data.userId;
            req.session.studentId = data.id;
            console.log("student id:", req.session.studentId);
            next();
          })
          .catch((err) => {
            console.log("My error:", err);
            if (err.name === "SequelizeUniqueConstraintError")
              return res.status(401).json({
                status: "failed",
                message: "This account is already created",
              });
            return next(
              new AppError("An error occured please try again ", 500)
            );
          });
      })
      .catch((err) => {
        console.log("My error:", err);
        if (err.name === "SequelizeUniqueConstraintError")
          return res.status(401).json({
            status: "failed",
            message: "This account is already created",
          });
        return next(new AppError("An error occured please try again ", 500));
      });
  }
});
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  console.log("Making token", token.split(" "));
  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  /* if (localStorage.getItem("jwt") !== token)
    return next(new AppError("someerror happen please try again", 401));*/

  // 2) Verification token
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, res) => {
    if (err) {
      console.log(err);
      return next(
        new AppError("An error occurred while verifying the token.", 500)
      );
    }
    console.log("##", res.iat - Date.now());
    /* if (Date.now() / 1000 - res.iat <= res.exp)
      return next(new AppError("Timed out please try again", 401));*/
    // 3) Check if user still exists
    user
      .findOne({
        where: { email: req.session.email },
      })
      .then((data) => {
        if (!data) {
          return next(
            new AppError(
              "The user belonging to this token does no longer exist.",
              401
            )
          );
        }
        // 4) Check if user changed password after the token was issued
        /*if (currentUser.changedPasswordAfter(decoded.iat)) {
          return next(
            new AppError("User recently changed password! Please log in again.", 401)
          );
        }*/
        // GRANT ACCESS TO PROTECTED ROUTE
        req.session.user = data;
        next();
      });
  });
});
