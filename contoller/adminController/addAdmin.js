const bcrypt = require("bcrypt");
const AppError = require("../../utils/appError");
const { admin, user } = require("../../models");
const catchAsync = require("../../utils/catchAsync");
exports.addAdmin = catchAsync(async (req, res, next) => {
  const adminData = req.body;
  if (adminData.password !== adminData.confirmPassword)
    res.status(400).json({
      status: "falied",
      message: "password and confirm password not matched",
    });
  else {
    adminData.confirmPassword = undefined;
    bcrypt.hash(adminData.password, 12, (err, hash) => {
      if (err)
        return next(new AppError("an error occurred please try again", 500));
      adminData.password = hash;
      adminData.role = process.env.ADMIN;
      user
        .create(adminData)
        .then((userData) => {
          admin
            .create({ userId: userData.id })
            .then(() => {
              res.status(200).json({
                status: "success",
                message: "added successfully",
              });
            })
            .catch((err) => {
              if (err)
                return next(
                  new AppError("an error occurred please try again", 500)
                );
            });
        })
        .catch((err) => {
          if (err.name === "SequelizeUniqueConstraintError")
            res.status(401).json({
              status: "failed",
              message: "This account is already created",
            });

          return next(new AppError("An error occured please try again ", 500));
        });
    });
  }
});
