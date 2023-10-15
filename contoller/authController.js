const jwt = require("jsonwebtoken");
const mysql = require("mysql");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
//const { connection, getDatabase } = require("./../utils/database");
const configration = {
  host: "localhost",
  user: "root",
  password: "",
  database: "unilife",
};
const createMessage = () => crypto.randomBytes(3).toString("hex").toUpperCase();
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

exports.login = catchAsync(async (req, res, next) => {
  const user = req.body;
  if (!user.email || !user.password)
    return next(new AppError("Please provide your email and password", 400));
  const query = `select * from student where Email=?`;
  let result = {};
  let connection = mysql.createConnection(configration);
  connection.connect((error) => {
    if (error) {
      return new AppError("Failed to connect to MySQL database!", 500);
    } else {
      console.log("Connected to MySQL database!");
    }
  });

  connection.query(query, user.email, (error, results, fields) => {
    if (error) {
      return new AppError("Failed to connect to MySQL database!", 500);
    }
    result = results[0];
    if (results.length > 1) return new AppError("########", 403);
    bcrypt.compare(
      user.password,
      result?.password,
      (err, passwordIsCorrect) => {
        if (err) {
          console.log("password mismatch");
          console.log(err.message);
          return new AppError("An error occured please try again", 401);
        }
        if (
          !passwordIsCorrect ||
          result?.Email !== user.email ||
          results.length === 0
        ) {
          console.log("email incorrect");
          return next(new AppError("Incorrect email or password", 401));
        }
        createSendToken(user, 200, res);
      }
    );
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
  let myPassword = "";
  bcrypt.hash(user.password, 12, (err, hash) => {
    if (err) {
      if (err) return new AppError("An error occured please try again ");
    }

    // 'hash' contains the hashed password, which you can store in your database
    console.log("Hashed Password:", hash);
    myPassword = hash;
    const myData = {
      Email: user.email,
      password: myPassword,
      phoneNumber: user.phoneNumber,
      userName: user.userName,
      universityId: user.universityId,
    };
    const query = `INSERT INTO student SET ?`;

    let connection = mysql.createConnection(configration);
    connection.connect((error) => {
      if (error) {
        return next(AppError("Failed to connect to MySQL database!", 500));
      } else {
        console.log("Connected to MySQL database!");
      }
    });

    connection.query(query, myData, (error) => {
      if (error) {
        if (error.code === "ER_DUP_ENTRY")
          return next(new AppError("This account is already created", 401));
        return next(new AppError("Failed to connect to MySQL database!", 500));
      }
      transportMessage(createMessage(), user.email);
      //we want to take the verficaion from user
      createSendToken(user, 201, res);
    });
  });
});
exports.forrgetPassword = catchAsync(async (req, res, next) => {
  const data = req.body;
  if (!data.newPassword || !data.confirmedPassword || !data.email)
    return new AppError("Please provide all required information", 400);
  const user = req.body;
  const query = "SELECT Email FROM student where Email=?";
  let connection = mysql.createConnection(configration);
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
  });
});
