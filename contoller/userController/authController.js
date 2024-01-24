const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const catchAsync = require("../../utils/catchAsync");
const { createMessage, transportMessage } = require("../../utils/email");
const { createSendToken } = require("../../utils/createToken");
const { pushNotification } = require("../../notification");
const { UploadFile, getURL, deleteFile } = require("../../firebaseConfig");

const { addToken } = require("../../utils/blackList");
const {
  uploadProcessData,
  getData,
  getFiles,
} = require("../../firebaseConfig");
const AppError = require("../../utils/appError");
const { student, user, FCM } = require("../../models");
const { file } = require("googleapis/build/src/apis/file");
const { resolve } = require("path");
let expiresIn = "24h";
exports.login = catchAsync(async (req, res, next) => {
  try {
    const data = req.body;
    const { email, password, token } = data;
    const myUser = await user.findOne({
      attributes: ["role", "id", "password", "email", "username"],
      where: { email },
    });

    console.log(myUser);
    if (!myUser)
      return res.status(400).json({
        status: "failed",
        message: "Incorrect email or password",
      });
    // const password = myUser.password;
    const passwordIsCorrect = await new Promise((resolve, reject) => {
      bcrypt.compare(password, myUser.password, (err, passwordIsCorrect) => {
        if (err) reject(err);
        resolve(passwordIsCorrect);
      });
    });

    if (!passwordIsCorrect)
      return res.status(400).json({
        status: "failed",
        message: "Incorrect email or password",
      });

    expiresIn = `24h`;
    data.id = myUser.id;
    data.role = myUser.role;
    data.username = myUser.username;
    if (myUser.role === process.env.STUDENT) {
      const studentId = await new Promise((resolve, reject) => {
        student
          .findOne({ where: { userId: data.id }, attributes: ["id"] })
          .then((record) => {
            if (record) resolve(record.id);
          });
      });
      await FCM.create({ token, studentId });
    }
    return createSendToken(data, 200, expiresIn, res);
  } catch (error) {
    console.log(error);
  }
});

exports.signup = catchAsync(async (req, res, next) => {
  const createdUser = req.body;
  //const image = req.file;
  console.log(createdUser);
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
    // req.session.image = image;

    req.session.verifyMessage = createMessage();
    console.log("verify", req.session.verifyMessage);
    //transportMessage(req.session.verifyMessage, createdUser.email);
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
    let status = false;
    await user
      .create(myData)
      .then(async (data) => {
        await student
          .create({ userId: data.id, major: req.session.major })
          .then((data) => {
            req.session.userId = data.userId;
            req.session.studentId = data.id;
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
    /* if (status) {
      const nameImage = `/student profile/${req.session.studentId}`;
      console.log("before uploading:", req.session.image);
      await UploadFile(req.session.image.buffer, nameImage);
      const image = await getURL(nameImage);
      await student.update({ image }, { where: { id: req.session.studentId } });
      return next();
    }*/
  }
});
exports.logout = catchAsync(async (req, res, next) => {
  addToken((token = req.headers.authorization.split(" ")[1]));
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  console.log(req.headers.authorization);
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
  console.log("token:", token);
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
  console.log(parseInt(req.params.userId));
  console.log("userToken=", id);
  console.log("userID=", parseInt(req.params.userId));
  if (parseInt(req.params.userId) !== id)
    return res.status(403).json({
      status: "failed",
      message: "not allowed1",
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
  console.log("role:", res.locals.role);
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
    let data = JSON.parse(req.body.data);

    const { major } = data;

    const file = req.file;
    const id = req.params.userId;
    const count = await new Promise((resolve, reject) => {
      user
        .update(data, { where: { id } })
        .then(([count]) => {
          resolve(count);
        })
        .catch((err) => reject(err));
    });

    console.log("count1=", count);
    if (count === 1) {
      let studentData = {};

      if (major) {
        studentData = { ...studentData, major };
      }

      if (count === 1) {
        let studentData = { major: data.major };

        if (file) {
          const nameImage = `/student profile/${id}`;
          await UploadFile(file.buffer, nameImage);
          const image = await getURL(nameImage);
          studentData = { ...studentData, image };
        }

        console.log("student:", studentData);
        const studentCount = await new Promise((resolve, reject) => {
          student
            .update(studentData, {
              where: { userId: id },
            })
            .then(([studentCount]) => {
              resolve(studentCount);
            })
            .catch((err) => reject(err));
        });

        if (studentCount === 1) {
          return res.status(200).json({
            status: "success",
            message: "Updated successfully",
          });
        } else {
          return res.status(404).json({
            status: "failed",
            message: "Not found",
          });
        }
      } else if (count === 0) {
        return res.status(404).json({
          status: "failed",
          message: "Not found",
        });
      }
    }
  } catch (err) {
    console.log(err);
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        status: "failed",
        message: "Already added",
      });
    }
    return res.status(500).json({
      status: "failed",
      message: "Internal Server Error",
    });
  }
});

exports.getPofile = catchAsync(async (req, res, next) => {
  const id = req.params.userId;
  let data = await new Promise((resolve, reject) => {
    user
      .findOne({
        attributes: ["username", "phoneNum", "email"],
        where: { id },
        include: [
          {
            model: student,
            attributes: ["major", "image"],
          },
        ],
      })
      .then((record) => {
        if (record) resolve(record);
        else
          return res
            .status(404)
            .json({ status: "failed", message: "not found" });
      });
  });
  data = {
    ...data.get(),
    image: data.student.image,
    major: data.student.major,

    student: undefined,
  };

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
exports.editPassword = async (req, res, next) => {
  try {
    const { password, newPassword, confirmPassword } = req.body;
    const { userId } = req.params;
    const passwordStored = await new Promise((resolve, reject) => {
      user
        .findOne({ where: { id: userId }, attributes: ["password"] })
        .then((record) => {
          resolve(record.password);
        })
        .catch((err) => {
          reject(err);
        });
    });
    if (!passwordStored)
      return res
        .status(404)
        .json({ status: "failed", message: "not found user" });
    const isCorrect = await new Promise((resolve, reject) => {
      bcrypt.compare(password, passwordStored, (err, passwordIsCorrect) => {
        if (err) reject(err);
        else resolve(passwordIsCorrect);
      });
    });
    if (!isCorrect)
      return res
        .status(400)
        .json({ status: "failed", message: "password incorrect" });
    if (newPassword !== confirmPassword)
      return res.status(400).json({
        status: "failed",
        message: "new password and confirm password doesn't match",
      });
    const hash = await new Promise((resolve, reject) => {
      bcrypt.hash(newPassword, 12, (err, hash) => {
        if (err) reject(err);
        else resolve(hash);
      });
    });
    console.log(hash);
    await user
      .update({ password: hash }, { where: { id: userId } })
      .then(([count]) => {
        if (count === 1)
          return res
            .status(200)
            .json({ status: "success", message: "updated successfully" });
        else
          return res
            .status(404)
            .json({ status: "failed", message: "not found user" });
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: "failed", message: "Internal Server Error" });
  }
};
exports.getUserId = async (req, res, next) => {
  try {
    const { token } = req.body;
    const userId = await new Promise((resolve, reject) => {
      FCM.findOne({
        where: { token },
        attributes: ["id", "username"],
        include: [{ model: student, attributes: ["userId"] }],
      })
        .then((record) => resolve(record.student.userId))
        .catch((err) => reject(err));
    });
    return res.status(200).json(userId);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: "failed", message: "Internal Server Error" });
  }
};
exports.getUser = async (req, res, next) => {
  try {
    // 1) Getting token and check of it's there
    let token;
    console.log("xDDDDDDD", req.headers.authorization);
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
    console.log("token:", token);
    const id = await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          console.log(err);
          return next(
            new AppError("An error occurred while verifying the token.", 500)
          );
        }
        resolve(decoded.id);
        console.log("Hi", decoded.id);
        /* if (Date.now() / 1000 - res.iat <= res.exp)
        return next(new AppError("Timed out please try again", 401));*/
      });
    });
    const username = await new Promise((resolve, reject) => {
      user
        .findOne({
          attributes: ["username"],
          where: { id },
        })
        .then((data) => {
          if (!data) {
            return res.status(401).json({
              status: "failed",
              message: "Unauthorized",
            });
          }
          console.log("my data", data.username);
          resolve(data.username);
        });
    });

    return res.status(200).json({ id, username });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: "failed", message: "Internal Server Error" });
  }
};
