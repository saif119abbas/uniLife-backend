const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const { student, user } = require("../../models");
const { Sequelize } = require("sequelize");
exports.getStudents = catchAsync(async (_, res) => {
  try {
    let data = await user.findAll({
      where: { role: process.env.STUDENT },
      attributes: ["id", "username", "phoneNum", "email", "createdAt"],
      include: [{ model: student, attributes: ["blocked", "image", "id"] }],
    });
    const formattedData = data.map((user) => ({
      ...user.get(),
      blocked: user.student.blocked,
      image: user.student.image,
      id: user.student.id,
      student: undefined,
    }));

    res.status(200).json(formattedData);
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ status: "fail", message: "An error occurred, please try again" });
  }
});
exports.blockedStudent = async (req, res) => {
  console.log("blockedStudent");
  try {
    const userId = req.params.studentId;
    const blocked = await new Promise((resolve) => {
      student
        .findOne({ where: { userId }, attributes: ["blocked"] })
        .then((record) => {
          console.log(record);
          if (!record)
            return res
              .status(404)
              .json({ status: "fail", message: "not found" });
          resolve(record.blocked);
        });
    });
    student
      .update({ blocked: !blocked }, { where: { userId } })
      .then(([count]) => {
        console.log(count);
        if (count === 0)
          return res.status(404).json({ status: "fail", message: "not found" });
        return res
          .status(200)
          .json({ status: "success", message: "updated successfully" });
      });
  } catch (err) {
    console.log("my error", err);
    return res
      .status(500)
      .json({ status: "fail", message: "Internal server error" });
  }
};
exports.unBlockedStudent = async (req, res) => {
  console.log("blockedStudent");
  try {
    const userId = req.params.studentId;
    student
      .update({ blocked: false }, { where: { userId } })
      .then(([count]) => {
        console.log(count);
        if (count === 0)
          return res.status(404).json({ status: "fail", message: "not found" });
        return res
          .status(200)
          .json({ status: "success", message: "student unblocked" });
      });
  } catch (err) {
    console.log("my error", err);
    return res
      .status(500)
      .json({ status: "fail", message: "Internal server error" });
  }
};
