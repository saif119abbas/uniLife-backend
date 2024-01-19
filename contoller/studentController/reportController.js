const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const { report, student, user, post } = require("../../models");
//const { pushNotification } = require("../../notification");
exports.createReport = async (req, res, next) => {
  try {
    const { message } = req.body;
    const { userId, reportedUser, postId } = req.params;
    const studentId = await new Promise((resolve, reject) => {
      student
        .findOne({ where: { userId }, attributes: ["id"] })
        .then((record) => {
          resolve(record.id);
        })
        .catch((err) => reject(err));
    });
    const reportedStudent = await new Promise((resolve, reject) => {
      student
        .findOne({ where: { userId: reportedUser }, attributes: ["id"] })
        .then((record) => {
          resolve(record.id);
        })
        .catch((err) => reject(err));
    });
    const data = { message, studentId, reportedStudent, postId };

    const id = await new Promise((resolve, reject) => {
      report
        .create(data)
        .then((record) => {
          resolve(record.id);
        })
        .catch((err) => reject(err));
    });
    return res
      .status(201)
      .json({ status: "success", message: "reported successfully" });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError")
      return res.status(409).json({
        status: "failed",
        message: "you are alreay reporting to this post",
      });
    return res
      .status(500)
      .json({ status: "failed", message: "Internal Server Error" });
  }
};
