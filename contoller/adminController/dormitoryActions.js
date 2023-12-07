const bcrypt = require("bcrypt");
const AppError = require("../../utils/appError");
const { dormitoryOwner, user } = require("../../models");
const catchAsync = require("../../utils/catchAsync");
const { where } = require("sequelize");
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
  const dormitoryId = req.params.dormitoryId;
  const dormitoryOwnerData = req.body;
  console.log(dormitoryOwnerData);
  if (dormitoryOwnerData.password !== dormitoryOwnerData.confirmPassword) {
    console.log("password mismatch");
    return res.status(400).json({
      status: "falied",
      message: "the password and confirm password do not match",
    });
  }
  const hash = await new Promise((resolve, reject) => {
    bcrypt.hash(dormitoryOwnerData.password, 12, (err, hash) => {
      if (err)
        return next(new AppError("an error occurred please try again", 500));
      resolve(hash);
    });
  });
  dormitoryOwnerData.password = hash;
  const id = await new Promise((resolve, reject) => {
    dormitoryOwner
      .findOne({ attributes: ["userId"], where: { id: dormitoryId } })
      .then((record) => {
        if (record) resolve(record.userId);
        else
          return res.status(404).json({
            status: "failed",
            message: "not found",
          });
      });
  });
  user
    .update(dormitoryOwnerData, {
      where: { id, role: process.env.DORMITORY },
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
        return res.status(404).json({ status: "failed", message: "not found" });
    })
    .catch((err) => {
      console.log(err);
      if (err)
        return next(new AppError("An error ouccred please try again", 500));
    });
});
exports.deleteDormitoryOwner = catchAsync(async (req, res, next) => {
  const dormitoryId = req.params.dormitoryId;

  const id = await new Promise((resolve, reject) => {
    dormitoryOwner.findOne({ where: { id: dormitoryId } }).then((record) => {
      if (record) resolve(record.userId);
      else
        return res.status(404).json({ status: "failed", message: "not found" });
    });
  });
  dormitoryOwner
    .destroy({ where: { id: dormitoryId } })
    .then((deleteCount) => {
      if (deleteCount > 1)
        return res.status(403).json({
          status: "failed",
          message: "not allowed",
        });
      else if (deleteCount === 1)
        user
          .destroy({ where: { id, role: process.env.DORMITORY } })
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
          .catch((err) => {
            console.log(err);
            return next(new AppError("An error occured please try again"), 500);
          });
      else if (deleteCount === 0)
        res.status(404).json({
          status: "failed",
          message: "This restaurant was not found",
        });
    })
    .catch((err) => {
      console.log(err);
      return next(new AppError("An error occured please try again"), 500);
    });
});
exports.getDormitoryOwners = catchAsync(async (_, res) => {
  const users = await user.findAll({
    attributes: ["id", "username", "email", "phoneNum"],
    where: { role: process.env.DORMITORY },
  });

  let data = [];
  for (const user of users) {
    const item = { id: "", username: "", email: "", phoneNum: "" };
    const { id } = await new Promise((resolve, reject) => {
      dormitoryOwner
        .findOne({ attributes: ["id"], where: { userId: user.id } })
        .then((record) => {
          resolve(record);
        });
    });
    item.id = id;
    item.username = user.username;
    item.email = user.email;
    item.phoneNum = user.phoneNum;
    data.push(item);
  }
  if (data.length === 0)
    return res.status(404).json({
      status: "failed",
      message: "no restaurants",
    });
  return res.status(200).json({
    status: "success",
    data,
  });
});
