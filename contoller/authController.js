const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const catchAsync = require("./../utils/catchAsync");
const { createMessage, transportMessage } = require("./../utils/email");
const { createSendToken } = require("./../utils/createToken");
const AppError = require("./../utils/appError");
const { student, schedule } = require("../models");
let verifyMessage = "";
let expiresIn = "24h";

exports.login = catchAsync(async (req, res, next) => {
  const user = req.body;
  if (!user.email || !user.password) {
    return res.status(400).json({
      status: "failed",
      message: "Please enter your email and password",
    });
  }

  student
    .findOne({
      where: {
        email: user.email,
      },
    })
    .then((record) => {
      if (record.length > 1) return next(new AppError("Not allowed", 403));
      const result = record;
      console.log(result);

      bcrypt.compare(
        user.password,
        result.password,
        (err, passwordIsCorrect) => {
          if (err) {
            return next(
              new AppError("An error occurred, please try again", 500)
            );
          }

          if (
            !passwordIsCorrect ||
            result?.email !== user.email ||
            record.length === 0
          ) {
            return res.status(401).json({
              status: "failed",
              message: "Incorrect email or password",
            });
          }

          // Authentication is successful, set session data and send the token
          req.session.email = user.email;
          req.session.ID = result.id;
          expiresIn = `${24 * 60 * 60}s`;
          user.id = result.id;
          createSendToken(user, 200, expiresIn, res);
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
  const user = req.body;
  if (
    !user.email ||
    !user.password ||
    !user.phoneNum ||
    !user.username ||
    !user.confirmPassword
  )
    res.status(400).json({
      status: "failed",
      message: "Please provide your information",
    });
  if (user.confirmPassword !== user.password)
    res.status(400).json({
      status: "falied",
      message: "password and confirm password not matched",
    });
  console.log("In signup");
  const userFound = await student.findOne({ where: { email: user.email } });
  if (userFound)
    res.status(401).json({
      status: "falied",
      message: "This student is already creted",
    });
  bcrypt.hash(user.password, 12, (err, hash) => {
    if (err) {
      if (err) return new AppError("An error occured please try again ", 500);
    }

    req.session.email = user.email;
    req.session.password = hash;
    req.session.phoneNum = user.phoneNum;
    req.session.username = user.username;

    verifyMessage = createMessage();
    transportMessage(verifyMessage, user.email);
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
    const ID = parseInt(req.session.unevirsityId);
    const myData = {
      email: req.session.email,
      password: req.session.password,
      phoneNum: req.session.phoneNum,
      username: req.session.username,
    };
    await student
      .create(myData)
      .then((data) => {
        const scheduleData = {
          status: "empty",
          studentId: data.id,
        };

        schedule
          .create(scheduleData)
          .then((data) => {
            console.log(data);
            req.session.scheduleId = data.scheduleId;
            console.log("create schedule:", req.session.scheduleId);
            res.status(201).json({
              status: "success",
              message: "Created successfully",
            });
          })
          .catch((err) => {
            console.log("My error:", err);
            if (err.name === "SequelizeUniqueConstraintError")
              res.status(401).json({
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
          res.status(401).json({
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
  console.log("Making token", token);
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
    const currentUser = student.findOne({
      where: { email: req.session.email },
    });
    if (!currentUser) {
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
    req.session.user = currentUser;
    next();
  });
});
