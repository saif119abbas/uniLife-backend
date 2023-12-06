const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const { schedule, lecture, student } = require("../../models");
exports.createSchedule = catchAsync(async (req, res, next) => {
  console.log("my ID:", typeof req.session.ID);
  const myData = {
    status: "empty",
    studentId: req.session.studentId,
  };
  await schedule
    .create(myData)
    .then((data) => {
      console.log(data);
      req.session.scheduleId = data.scheduleId;
      res.status(201).json({
        status: "success",
        message: "Created successfully",
      });
    })
    .catch((err) => {
      console.log("My error:", err);
      if (err.name === "SequelizeUniqueConstraintError")
        return res.status(409).json({
          status: "success",
          message: "This account is already created",
        });
      return next(new AppError("An error occured please try again ", 500));
    });
});
exports.addLecture = catchAsync(async (req, res, next) => {
  //const studentId = req.params.studentId;
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

  const data = req.body;
  console.log(data.day);
  data.day = data.day.join(" ");
  const lectureId = parseInt(data.lectureId);
  const classNumber = data.classNumber;
  const mySchedule = await schedule.findOne({
    where: {
      studentId,
    },
  });
  if (!mySchedule)
    res.status(400).json({
      status: "failed",
      message: "You need to create a new schedule",
    });
  else {
    data.lecture = lectureId;
    data.classNumber = classNumber;
    data.scheduleScheduleId = mySchedule.scheduleId;
    await lecture
      .create(data)
      .then((data) => {
        req.session.lectureId = data.id;
        success = true;
        res.status(201).json({
          status: "success",
          message: "added successfully",
        });
      })
      .catch((err) => {
        console.log("My error:", err);
        if (err.name === "SequelizeUniqueConstraintError")
          res.status(400).json({
            status: "failed",
            message: "This lecture is alreay added",
          });
        else
          return next(new AppError("1An error occured please try again", 500));
      });
  }
});
exports.editLecture = catchAsync(async (req, res, next) => {
  // const studentId = req.params.studentId;
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
  const studentId = myStudent.Id;
  const data = req.body;
  if (data.lectureId) {
    data.lectureId = parseInt(data.lectureId);
  }
  const id = req.params.lectureId;
  await lecture.update(data, { where: { id } }).then((count) => {
    console.log("Updated", count[0]);
    if (count[0] === 0)
      return res.status(404).json({
        status: "faield",
        message: "This lecture was not found",
      });
    else
      return res.status(200).json({
        status: "success",
        message: " successfully updated",
      });
  });
});
exports.deleteLecture = catchAsync(async (req, res, next) => {
  let id = req.params.lectureId;
  console.log("Lecture ID=", id);
  if (!id)
    return next(new AppError("You need to provide lecture to delete", 400));
  id = parseInt(id);
  lecture
    .destroy({ where: { id } })
    .then((deleteCount) => {
      if (deleteCount > 1)
        return next(new AppError("Somethig went wrong please try again", 500));
      else if (deleteCount == 1)
        res.status(204).json({
          status: "success",
          message: "The lecture was deleted successfully",
        });
      else if (deleteCount == 0)
        res.status(404).json({
          status: "failed",
          message: "This lecture was not found",
        });
    })
    .catch((err) => {
      return next(new AppError("An error occured please try again"), 500);
    });
});
exports.getLectures = catchAsync(async (req, res, next) => {
  //const studentId = req.params.studentId;
  console.log(studentId);
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
    where: { studentId },
  });
  console.log(mySchedule);
  await lecture
    .findAll({
      attributes: [
        "id",
        "lectureId",
        "classNumber",
        "Name",
        "startTime",
        "endTime",
        "day",
      ],
      where: {
        scheduleScheduleId: mySchedule.scheduleId,
      },
    })
    .then((data) => {
      if (data.length === 0)
        return res.status(404).json({
          status: "failed",
          message: "you don't have a lecture this day",
        });

      return res.status(200).json(data);
    })
    .catch((err) => {
      console.log("My error occurred", err);
      if (err) return next(new AppError("an ouccured please try again", 500));
    });
});
