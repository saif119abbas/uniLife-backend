const bcrypt = require("bcrypt");
const catchAsync = require("./../utils/catchAsync");
const { createMessage, transportMessage } = require("./../utils/email");
const { student } = require("../models");
const AppError = require("./../utils/appError");
let verifyMessage = "";
exports.forrgetPassword = catchAsync(async (req, res, next) => {
  const data = req.body;
  if (!data.email)
    res.status(400).json({
      status: "failed",
      message: "Please provide your email ",
    });
  req.session.email = data.email;
  const user = await student.findOne({ where: { email: data.email } });
  if (!user)
    res.status(400).json({
      status: "failed",
      message: "This user does not exist",
    });
  const email = user.email;
  verifyMessage = createMessage();
  transportMessage(verifyMessage, email);
  res.status(200).json({
    status: "success",
    message: "check your email ",
  });
});
exports.verifyUpdatePassword = catchAsync(async (req, res, next) => {
  if (!req.body.verifyCode)
    res.status(400).json({
      status: "failed",
      message: "please enter your verfication code",
    });
  if (req.body.verifyCode === verifyMessage) {
    console.log("verify update password");
    verifyMessage = "";
    res.status(200).json({
      status: "success",
    });
  } else {
    res.status(401).json({
      status: "failed",
      message: "verification code is not correct",
    });
  }
});
exports.restPassword = catchAsync(async (req, res, next) => {
  if (!req.session.email)
    res.status(403).json({
      status: "failed",
      message: "Bad request",
    });
  const data = req.body;
  const email = req.session.email;

  if (!data.confirmedPassword || !data.newPassword)
    res.status(400).json({
      status: "failed",
      message: "please enter your password and confirm your password",
    });

  if (data.confirmedPassword === data.newPassword) {
    bcrypt.hash(data.newPassword, 12, (err, hash) => {
      if (err)
        return next(new AppError("an error occured please try again", 500));
      student
        .update(
          { password: hash },
          {
            where: {
              Email: email,
            },
          }
        )
        .then(() => {
          res.status(200).json({
            status: "failed",
            message: "updated successfuly",
          });
        })
        .catch(() => {
          return next(new AppError("An error occured please try again", 500));
        });
    });
  } else {
    res.status(401).json({
      status: "failed",
      message: "confired password and password do not match",
    });
  }
});
