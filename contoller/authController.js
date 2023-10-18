const jwt = require("jsonwebtoken");
const mysql = require("mysql2");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const { student } = require("../models");

const createMessage = () => crypto.randomBytes(3).toString("hex").toUpperCase();
let verifyMessage = "";
const transportMessage = (myMessage, email) => {
  const transporter = nodemailer.createTransport({
    /* host: "sandbox.smtp.mailtrap.io",
    port: 2525,*/
    service: "Gmail",
    auth: {
      user: "saifaldawlaabbas@gmail.com",
      pass: "saif11926449",
    },
  });
  console.log("My message: ", myMessage);
  const mailOptions = {
    from: "saifaldawlaabbas@gmail.com",
    to: email,
    subject: "Email Verification",
    text: myMessage,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.universityId);
  const cookieOptions = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

const signToken = (id) => {
  return jwt.sign(
    { id },
    "my-name-is-saif-and-i-have-18-hours-to-be-gradutaed",
    {
      expiresIn: "90days",
    }
  );
};
exports.loginRender = catchAsync(async (req, res, next) => {
  res.render("login");
});

exports.login = catchAsync(async (req, res, next) => {
  const user = req.body;
  if (!user.email || !user.password)
    return next(new AppError("Please provide your email and password", 400));
  student
    .findAll({
      where: {
        Email: user.email,
      },
    })
    .then((records) => {
      if (records > 1) return next(new AppError("not allowed", 403));
      const result = records[0];
      bcrypt.compare(
        user.password,
        result.password,
        (err, passwordIsCorrect) => {
          if (err)
            return new AppError("An error occured please try again", 401);
          if (
            !passwordIsCorrect ||
            result?.Email !== user.email ||
            records.length === 0
          ) {
            console.log("email incorrect");
            return next(new AppError("Incorrect email or password", 401));
          }
          createSendToken(user, 200, res);
        }
      );
    })
    .catch((err) => {
      return next(new AppError("Incorrect email or password", 401));
    });
});
exports.signup = catchAsync(async (req, res, next) => {
  const user = req.body;
  if (
    !user.email ||
    !user.password ||
    !user.phoneNumber ||
    !user.userName ||
    !user.universityId
  )
    return next(new AppError("Please provide your information", 400));

  bcrypt.hash(user.password, 12, (err, hash) => {
    if (err) {
      if (err) return new AppError("An error occured please try again ", 500);
    }

    req.session.Email = user.email;
    req.session.password = hash;
    req.session.phoneNumber = user.phoneNumber;
    req.session.userName = user.userName;
    req.session.unevirsityId = user.unevirsityId;
    verifyMessage = createMessage();
    console.log(verifyMessage);
    //send email
    res.redirect(307, "/verify");
  });
});
exports.signupRender = catchAsync(async (req, res) => {
  res.render("signup");
});
exports.verify = catchAsync(async (req, res, next) => {
  console.log("verify");
  if (!req.body)
    return next(
      new AppError(
        "You need to provide the verfication code to verify your account",
        400
      )
    );
  if (req.body.verifyCode === "yes") {
    const myData = {
      Email: req.session.email,
      password: req.session.password,
      phoneNumber: req.session.phoneNumber,
      userName: req.session.userName,
      unevirsityId: req.session.universityId,
    };
    student
      .create(myData)
      .then(() => {
        /*transportMessage(createMessage(), user.email);
        createSendToken(user, 201, res);*/
        res.redirect("/login");
      })
      .catch((err) => {
        console.log("My error:", err);
        if (err.name === "SequelizeUniqueConstraintError")
          return next(new AppError("This account is already created", 401));

        return next(new AppError("An error occured please try again ", 500));
      });
    res.redirect(307, "/login");
  }
});
exports.verifyRender = catchAsync(async (req, res) => {
  res.render("verify");
});
exports.forrgetPassword = catchAsync(async (req, res, next) => {
  const data = req.body;
  if (!data.newPassword || !data.confirmedPassword || !data.email)
    return new AppError("Please provide all required information", 400);
  const user = req.body;
  const query = "SELECT Email FROM student where Email=?";
  /*let connection = mysql.createConnection(configration);
  connection.connect((error) => {
    if (error) {
      return next(new AppError("Failed to connect to MySQL database!", 500));
    } else {
      console.log("Connected to MySQL database!");
    }
  });

  connection.query(query, data.email, (error, results) => {
    if (error) {
      return next(new AppError("Failed to connect to MySQL database!", 500));
    }
    if (results.length == 0)
      res.status(404).json({
        status: "failed",
        message: "This email does not found",
      });
    else if (results.length == 1) {
      if (user.newPassword === user.confirmedPassword) {
        {
          // createSendToken(user, 200, res);
          const query2 = "update student set password=? where email=?";
          // bcrypt.hash(user);
          bcrypt.hash(user.newPassword, 12, (error, hash) => {
            if (error) {
              return next(
                new AppError("Something went wrong please try again", 500)
              );
            }
            const data = [hash, user.email];
            connection.query(query2, data, (err, result) => {
              if (err) {
                return next(
                  new AppError("Failed to connect to MySQL database!", 500)
                );
              }
              res.status(200).json({
                status: "success",
                message: "Done",
              });
              console.log(result);
            });
          });
        }
      } else
        res.status(400).json({
          status: "failed",
          message: "nooooo",
        });
    } else
      res.status(403).json({
        status: "failed",
        message: "not allowed",
      });
    //transportMessage(createMessage(), user.email);
    //we want to take the verficaion from user
  });*/
});
