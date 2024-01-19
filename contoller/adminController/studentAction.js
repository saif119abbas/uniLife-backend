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
    student
      .update(
        { blocked: Sequelize.literal("NOT blocked") },
        { where: { userId } }
      )
      .then(([count]) => {
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