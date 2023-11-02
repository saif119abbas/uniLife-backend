const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
//const promisify = require("promisify");
const { google } = require("googleapis");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const { student, schedule } = require("../models");
const OAuth2 = google.auth.OAuth2;

const createMessage = () => crypto.randomBytes(3).toString("hex").toUpperCase();
let verifyMessage = "";
let expiresIn = "24h";
let stratTime = "";
const transportMessage = (myMessage, email, subject = "Verification Email") => {
  const oauth2Client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDICT_URL
  );
  oauth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

  const accessToken = oauth2Client.getAccessToken();

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      type: "OAuth2",
      user: process.env.USER,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
      accessToken: accessToken,
    },
  });
  const mailOptions = {
    from: process.env.USER,
    to: email,
    subject,
    text: myMessage,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("error");
      console.log(error);
    } else {
      console.log("No error");
      while (!info.response.split(" ")[2] === "OK");

      console.log("Email sent: " + info.response);
    }
  });
  transporter.close();
};
const createSendToken = (user, statusCode, res) => {
  console.log("created Token:", user.unevirsityId);
  const token = signToken(user.unevirsityId);
  const cookieOptions = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);
  //localStorage.setItem("jwt", token);

  // Remove password from output
  user.password = undefined;
  console.log("Here in your browser");
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

const signToken = (id) => {
  return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn });
};
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
          req.session.Email = user.email;
          req.session.ID = result.unevirsityId;

          console.log("from user", typeof req.session.ID);
          expiresIn = Date.now() + 24 * 60 * 60000;
          createSendToken(user, 200, res);
        }
      );
    })
    .catch((err) => {
      console.log(err.message);
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
    !user.unevirsityId
  )
    return next(new AppError("Please provide your information", 400));
  console.log("In signup");
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
    transportMessage(verifyMessage, user.email);
    stratTime = Date.now();
    expiredIn = 60;
    createSendToken(user, 200, res);
  });
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
  if (req.body.verifyCode === verifyMessage) {
    verifyMessage = "";
    //expiresIn = "24h";
    const ID = parseInt(req.session.unevirsityId);
    const myData = {
      Email: req.session.Email,
      password: req.session.password,
      phoneNumber: req.session.phoneNumber,
      userName: req.session.userName,
      unevirsityId: ID,
    };
    await student
      .create(myData)
      .then(() => {
        console.log("successfully created");
        const scheduleData = {
          status: "empty",
          studentUnevirsityId: myData.unevirsityId,
        };

        schedule
          .create(scheduleData)
          .then((data) => {
            //console.log(req.session.scheduleData);
            console.log(data);
            req.session.scheduleId = data.scheduleId;
            console.log("create schedule:", req.session.scheduleId);
            res.status(201).json({
              status: "success",
              message: "Created successfully",
            });
            //res.redirect(307, "/api/v1/unilife/addLecture");
          })
          .catch((err) => {
            console.log("My error:", err);
            if (err.name === "SequelizeUniqueConstraintError")
              return next(new AppError("This account is already created", 401));

            return next(
              new AppError("An error occured please try again ", 500)
            );
          });
      })
      .catch((err) => {
        console.log("My error:", err);
        if (err.name === "SequelizeUniqueConstraintError")
          return next(new AppError("This account is already created", 401));

        return next(new AppError("An error occured please try again ", 500));
      });
  }
});
exports.forrgetPassword = catchAsync(async (req, res, next) => {
  const data = req.body;
  if (!data.email)
    return new AppError("Please provide all required information", 400);
  req.session.email = data.email;
  const user = await student.findOne({ where: { Email: data.email } });
  if (!user) return next(new AppError("this email is not found"));
  const Email = user.Email;
  verifyMessage = createMessage();
  transportMessage(verifyMessage, Email);
  next();
  //res.redirect(307, "/api/v1/unilife/verifyUpdatePassword");
});
exports.verifyUpdatePassword = catchAsync(async (req, res, next) => {
  console.log("verify update passwrd");
  if (!req.body.verifyCode)
    return next(new AppError("please enter your verfication code", 400));
  if (req.body.verifyCode === verifyMessage) {
    verifyMessage = "";
    //res.redirect(307, "/api/v1/unilife/restPassword");
    next();
  } else {
    return next(new AppError("verification code is not correct", 401));
  }
});
exports.restPassword = catchAsync(async (req, res, next) => {
  if (!req.session.email) return next(new AppError("Bad request", 403));
  const data = req.body;
  const email = req.session.email;

  if (!data.confirmedPassword || !data.newPassword)
    return next(
      new AppError("please enter your password and confirm your password", 400)
    );
  if (data.confirmedPassword === data.newPassword) {
    bcrypt.hash(data.newPassword, 12, (err, hash) => {
      if (err)
        return next(new AppError("an error occured please try again", 401));
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
          return next(new AppError("updated successfuly", 200));
        })
        .catch(() => {
          return next(new AppError("An error occured please try again", 500));
        });
      res.status(200).json({
        status: "success",
        message: "updated successfully",
      });
    });
  } else {
    return next(new AppError("not same", 401));
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
    if (Date.now() / 1000 - res.iat <= res.exp)
      return next(new AppError("Timed out please try again", 401));
    // 3) Check if user still exists
    const currentUser = student.findOne({
      where: { Email: req.session.Email },
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
