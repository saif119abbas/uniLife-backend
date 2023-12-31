const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const catchAsync = require("../../utils/catchAsync");
const { createMessage, transportMessage } = require("../../utils/email");
const { createSendToken } = require("../../utils/createToken");
const { pushNotification } = require("../../notification");
const { createImage, getQRcode } = require("../../utils/qrcode");
const {
  uploadProcessData,
  getData,
  getFiles,
} = require("../../firebaseConfig");
const AppError = require("../../utils/appError");
const { student, user } = require("../../models");
const { UploadFile } = require("../../firebaseConfig");
//let verifyMessage = "";
let expiresIn = "24h";

exports.login = catchAsync(async (req, res, next) => {
  const data = req.body;
  /*const URL = await getQRcode(JSON.stringify(data));
  const file = Buffer.from(URL, "base64");
  UploadFile(file, "/qrcode/image.png");*/

  await user
    .findOne({
      attributes: ["role", "id", "password", "email", "username"],
      where: { email: data.email },
    })
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
            console.log("the er", err);
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
            expiresIn = `24h`;
            data.id = result.id;
            data.role = result.role;
            data.username = result.username;
            //  pushNotification();
            //console.log("success", success);
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
  /*if (!myUser)
    return res.status(400).json({
      status: "failed",
      message: "Incorrect email or password",
    });
  const password = myUser.password;
  const passwordIsCorrect = await new Promise((resolve, reject) => {
    bcrypt.compare(data.password, password, (err, passwordIsCorrect) => {
      if (err) reject(err);
      resolve(passwordIsCorrect);
    });
  });
  if (!passwordIsCorrect)
    return res.status(400).json({
      status: "failed",
      message: "Incorrect email or password",
    });
  const id = await new Promise((resolve, reject) => {
    student.findOne({ where: { userId: myUser.id } }).then((record) => {
      if (record.id) resolve(record.id);
      else
        return res
          .status(400)
          .json({
            status: "failed",
            message: "Incorrect email or password",
          })
          .catch((err) => {
            reject(err);
          });
    });
  });
  expiresIn = `24h`;
  data.id = id;
  data.role = myUser.role;
  createSendToken(data, 200, expiresIn, res);*/
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
    req.session.major = createdUser.major;

    req.session.verifyMessage = createMessage();
    console.log("verify", req.session.verifyMessage);
    transportMessage(req.session.verifyMessage, createdUser.email);
    stratTime = Date.now();
    expiresIn = "60s";
    res.status(200).json({
      status: "success",
    });
  });
});

exports.verify = catchAsync(async (req, res, next) => {
  console.log("verify", req.session.verifyMessage);
  if (!req.body)
    res.status(400).json({
      status: "failed",
      message:
        "You need to provide the verfication code to verify your account",
    });

  if (req.body.verifyCode === req.session.verifyMessage) {
    req.session.verifyMessage = "";
    //expiresIn = "24h";
    console.log(
      req.session.email,
      req.session.password,
      req.session.phoneNum,
      req.session.major
    );
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
          .create({ userId: data.id, major: req.session.major })
          .then((data) => {
            req.session.userId = data.userId;
            req.session.studentId = data.id;
            console.log("student id:", req.session.studentId);
            return next();
          })
          .catch((err) => {
            console.log("My error:", err);
            if (err.name === "SequelizeUniqueConstraintError")
              return res.status(409).json({
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
          return res.status(409).json({
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
    console.log("Yes");
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return res.status(401).json({
      status: "failed",
      message: "Unauthorized",
    });
  }

  /* if (localStorage.getItem("jwt") !== token)
    return next(new AppError("someerror happen please try again", 401));*/

  // 2) Verification token
  const id = await new Promise((resolve, reject) => {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        console.log(err);
        return next(
          new AppError("An error occurred while verifying the token.", 500)
        );
      }
      resolve(decoded.id);
      /* if (Date.now() / 1000 - res.iat <= res.exp)
        return next(new AppError("Timed out please try again", 401));*/
    });
  });
  if (parseInt(req.params.userId) !== id)
    return res.status(403).json({
      status: "failed",
      message: "not allowed",
    });
  // 3) Check if user still exists

  const role = await new Promise((resolve, reject) => {
    user
      .findOne({
        attributes: ["role"],
        where: { id },
      })
      .then((data) => {
        if (!data) {
          return res.status(401).json({
            status: "failed",
            message: "Unauthorized",
          });
        }
        console.log("my data", data.role);
        resolve(data.role);
      });
  });
  res.locals.role = role;
  next();
  // 4) Check if user changed password after the token was issued
  /*if (currentUser.changedPasswordAfter(decoded.iat)) {
          return next(
            new AppError("User recently changed password! Please log in again.", 401)
          );
        }*/
  // GRANT ACCESS TO PROTECTED ROUTE
  /*req.session.user = data;
      })*/
});
exports.editProfile = catchAsync(async (req, res, next) => {
  try {
    let data = req.body;
    const id = req.params.userId;
    if (data.password) {
      if (data.password !== data.confirmPassword)
        return res.status(400).json({
          status: "failed",
          messag: "password and confirm password do not match",
        });
      const hash = await new Promise((resolve, reject) => {
        bcrypt.hash(data.password, 12, (err, hash) => {
          if (err) reject(err);
          else resolve(hash);
        });
      });
      data.password = hash;
      user.update(data, { where: { id } }).then((count) => {
        if (count[0] === 1)
          return res.status(200).json({
            status: "failed",
            message: "updated successfully",
          });
        else if (count[0] === 0)
          return res.status(404).json({
            status: "failed",
            message: "not found",
          });
      });
    }
  } catch (err) {
    return next(new AppError("An error occurred please try again", 500));
  }
});
exports.getPofile = catchAsync(async (req, res, next) => {
  const id = req.params.userId;
  const data = await new Promise((resolve, reject) => {
    user
      .findOne({
        attributes: ["username", "phoneNum", "email"],
        where: { id },
      })
      .then((record) => {
        if (record) resolve(record);
        else
          return res
            .status(404)
            .json({ status: "failed", message: "not found" });
      });
  });
  return res.status(200).json(data);
});
exports.storeData = catchAsync(async (req, res) => {
  const image = req.file.buffer || req.files.image[0];
  const data = await uploadProcessData();
  res.status(200).json(data);
});
exports.downloadFile = catchAsync(async (req, res) => {
  const URL = req.body.URL;
  const data = await getFiles(URL);
  res.status(200).json(data);
});
exports.retriveData = catchAsync(async (_, res) => {
  const data = await getData();
  console.log(data);
  res.status(200).json(data);
});
