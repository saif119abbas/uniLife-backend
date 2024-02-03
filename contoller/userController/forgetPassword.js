const bcrypt = require("bcrypt");
const catchAsync = require("../../utils/catchAsync");
const { createMessage, transportMessage } = require("../../utils/email");
const { student, user } = require("../../models");
const AppError = require("../../utils/appError");
const { createSendToken } = require("../../utils/createToken");

let verifyMessage = "";
exports.forrgetPassword = catchAsync(async (req, res) => {
  try {
    const data = req.body;
    req.session.email = data.email;
    const myUser = await user
      .findOne({ where: { email: data.email } })
      .catch((err) => {
        throw err;
      });
    if (!myUser)
      res.status(400).json({
        status: "failed",
        message: "This user does not exist",
      });
    const email = myUser.email;
    verifyMessage = createMessage();
    transportMessage(verifyMessage, email);
    const myToken = {
      status: "success",
      message: "check your email",
    };
    createSendToken(myToken, 200, "30s", res);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "failed",
      message: "Internal Server Error",
    });
  }
});
exports.verifyUpdatePassword = catchAsync(async (req, res) => {
  try {
    if (req.body.verifyCode === verifyMessage) {
      const data = {
        id: verifyMessage,
      };
      verifyMessage = "";
      return createSendToken(data, 200, "60s", res);
    }
    return res.status(401).json({
      status: "failed",
      message: "verification code is not correct",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "failed",
      message: "Internal Server Error",
    });
  }
});
exports.restPassword = catchAsync(async (req, res, next) => {
  try {
    if (!req.session.email)
      return res.status(403).json({
        status: "failed",
        message: "Bad request",
      });
    const data = req.body;
    const email = req.session.email;
    console.log(email);

    if (data.password === data.confirmPassword) {
      bcrypt.hash(data.password, 12, (err, hash) => {
        if (err)
          return res.status(500).json({
            status: "failed",
            message: "Internal Server Error",
          });
        user
          .update(
            { password: hash },
            {
              where: {
                email: email,
              },
            }
          )
          .then(() => {
            res.status(200).json({
              status: "success",
              message: "updated successfuly",
            });
          })
          .catch((err) => {
            return res.status(500).json({
              status: "failed",
              message: "Internal Server Error",
            });
          });
      });
    } else {
      res.status(401).json({
        status: "failed",
        message: "confirmed password and password do not match",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "failed",
      message: "Internal Server Error",
    });
  }
});
