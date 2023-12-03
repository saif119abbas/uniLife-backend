const bcrypt = require("bcrypt");
const AppError = require("../../utils/appError");
const { dormitoryOwner, user } = require("../../models");
const catchAsync = require("../../utils/catchAsync");
exports.addDormitoryOwner = (req, res, next) => {
  const dormitoryOwnerData = req.body;
  console.log(dormitoryOwnerData);
  if (dormitoryOwnerData.password !== dormitoryOwnerData.confirmPassword) {
    return res.status(400).json({
      status: "failed",
      message: "password and confirm password don't matched",
    });
  }
  dormitoryOwnerData.confirmPassword = undefined;
  bcrypt.hash(dormitoryOwnerData.password, 12, (err, hash) => {
    if (err)
      return next(new AppError("an error occurred please try again", 500));
    dormitoryOwnerData.password = hash;
    const SSN = dormitoryOwnerData.SSN;
    dormitoryOwnerData.role = process.env.DORMITORY;
    user
      .create(dormitoryOwnerData)
      .then((data) => {
        dormitoryOwner
          .create({ SSN, userId: data.id })
          .then(() => {
            res.status(201).json({
              status: "success",
              message: "created successfully",
            });
          })
          .catch((err) => {
            if (err.name === "SequelizeUniqueConstraintError")
              res.status(409).json({
                status: "failed",
                message: "This account is already created",
              });

            return next(
              new AppError("An error occured please try again ", 500)
            );
          });
      })
      .catch((err) => {
        console.log("My err", err);
        if (err.name === "SequelizeUniqueConstraintError")
          res.status(401).json({
            status: "failed",
            message: "This account is already created",
          });

        return next(new AppError("An error occured please try again ", 500));
      });
  });
};
exports.editDormitoryOwner = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  const dormitoryOwnerData = req.body;
  console.log(dormitoryOwnerData);
  bcrypt.hash(dormitoryOwnerData.password, 12, (err, hash) => {
    if (err)
      return next(new AppError("an error occurred please try again", 500));
    if (dormitoryOwnerData.password !== dormitoryOwnerData.confirmPassword) {
      console.log("password mismatch");
      res.status(400).json({
        status: "falied",
        message: "the password and confirm password do not match",
      });
    } else {
      dormitoryOwnerData.password = hash;
      user
        .update(dormitoryOwnerData, {
          where: { id: userId, role: process.env.DORMITORY },
        })
        .then((count) => {
          if (count[0] > 1)
            return res
              .status(403)
              .json({ status: "failed", message: "not allowed" });
          else if (count[0] === 1)
            res
              .status(200)
              .json({ status: "Success", message: "Updated successfully" });
          else
            return res
              .status(404)
              .json({ status: "failed", message: "not found" });
        })
        .catch((err) => {
          if (err)
            return next(new AppError("An error ouccred please try again", 500));
        });
    }
  });
});
exports.deleteDormitoryOwner = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  dormitoryOwner
    .destroy({ where: { userId } })
    .then((deleteCount) => {
      if (deleteCount > 1)
        return res.status(403).json({
          status: "failed",
          message: "not allowed",
        });
      else if (deleteCount === 1)
        user
          .destroy({ where: { id: userId, role: process.env.DORMITORY } })
          .then((deleteCount) => {
            if (deleteCount > 1)
              res.status(403).json({
                status: "failed",
                message: "not allowed",
              });
            else if (deleteCount === 1)
              res.status(204).json({
                status: "success",
                message: "deleted successfully",
              });
            else if (deleteCount === 0)
              res.status(404).json({
                status: "failed",
                message: "not found",
              });
          })
          .catch(() => {
            return next(new AppError("An error occured please try again"), 500);
          });
      else if (deleteCount === 0)
        res.status(404).json({
          status: "failed",
          message: "This restaurant was not found",
        });
    })
    .catch(() => {
      return next(new AppError("An error occured please try again"), 500);
    });
});
exports.editSSN = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  const SSN = req.body.SSN;
  if (!SSN) next();
  dormitoryOwner
    .update({ SSN }, { where: { userId } })
    .then((count) => {
      if (count[0] > 1)
        return res
          .status(403)
          .json({ status: "failed", message: "not allowed" });
      else if (count[0] === 1) next();
      else if (count[0] === 0)
        res.status(404).json({
          status: "failed",
          message: "not found",
        });
    })
    .catch((err) => {
      if (err.name === "SequelizeUniqueConstraintError")
        return res.status(401).json({
          status: "failed",
          message: "you are not allowed to use this SSN",
        });
      return next(new AppError("An error occured please try again"), 500);
    });
});
exports.getDormitoryOwners = catchAsync(async (_, res) => {
  const data = await user.findAll({
    attributes: ["id", "username", "email", "phoneNum"],
    where: { role: process.env.DORMITORY },
  });
  res.status(200).json({
    status: "success",
    data,
  });
});
