const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { schedule, lecture, student } = require("../models");
exports.lectureCheck = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  const myStudent = await student.findOne({
    attributes: ["id"],
    where: { userId },
  });
  if (!myStudent) {
    return res.status(403).json({
      status: "Not allowed action",
      message: "Something went wrong please try again",
    });
  }
  const studentId = myStudent.id;
  const mySchedule = await schedule.findOne({
    attributes: ["scheduleId"],
    where: { studentId },
  });
  if (!mySchedule) {
    return res.status(403).json({
      status: "Not allowed action",
      message: "Something went wrong please try again",
    });
  }
  const id = req.params.lectureId;
  const myLecture = await lecture.findOne({
    attributes: ["scheduleScheduleId"],
    where: { id },
  });
  if (!myLecture) {
    return res.status(404).json({
      status: "failed",
      message: "not found",
    });
  }
  if (mySchedule.scheduleId !== myLecture.scheduleScheduleId)
    return res.status(403).json({
      status: "failed",
      message: "not allowed",
    });
  else return next();
});
