const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const { schedule, lecture } = require("../../models");
exports.createSchedule = catchAsync(async (req, res, next) => {
  if (!req.body.status)
    return next(new AppError("provide the status of your schedule", 400));
  console.log("my ID:", typeof req.session.ID);
  const myData = {
    status: req.body.status,
    studentUnevirsityId: req.session.ID,
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
        return next(new AppError("This account is already created", 401));

      return next(new AppError("An error occured please try again ", 500));
    });
});
exports.addLecture = catchAsync(async (req, res, next) => {
  const data = req.body;
  if (
    !data.lectureId ||
    !data.classNumber ||
    !data.Name ||
    !data.startTime ||
    !data.endTime ||
    !data.day
  )
    return next(new AppError("provide the lecture information please", 400));
  const lectureId = parseInt(data.lectureId);
  const classNumber = data.classNumber;
  const mySchedule = await schedule.findOne({
    where: {
      studentId: req.session.ID,
    },
  });
  if (!mySchedule)
    return next(new AppError("You need to create a new schedule", 400));
  const myData = {
    lectureId,
    classNumber,
    Name: data.Name,
    startTime: data.startTime,
    endTime: data.endTime,
    day: data.day,
    scheduleScheduleId: mySchedule.scheduleId,
  };

  let success = false;
  await lecture
    .create(myData)
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
        return next(new AppError("This lecture is alreay added", 400));
      else return next(new AppError("1An error occured please try again", 500));
    });
});
exports.editSchedule = catchAsync(async (req, res, next) => {});
exports.deleteSchedule = catchAsync(async (req, res, next) => {});
exports.editLecture = catchAsync(async (req, res, next) => {
  const data = req.body;
  if (
    !data.lectureId &&
    !data.classNumber &&
    !data.Name &&
    !data.startTime &&
    !data.endTime &&
    !data.day
  )
    return next(
      new AppError("Please provide the information you want to edit", 400)
    );
  let lectureId = "$$";

  const editLecture = {};
  if (data.lectureId) {
    lectureId = parseInt(data.lectureId);
    editLecture.lectureId = lectureId;
  }
  if (data.classNumber) {
    editLecture.classNumber = data.classNumber;
  }
  if (data.Name) {
    editLecture.Name = data.Name;
  }
  if (data.startTime) {
    editLecture.startTime = data.startTime;
  }
  if (data.endTime) {
    editLecture.endTime = data.endTime;
  }
  if (data.day) {
    editLecture.day = data.day;
  }
  const id = req.params.id;
  const count = await lecture.update(editLecture, { where: { id: id } });
  if (count === 0)
    res.status(404).json({
      status: "faield",
      message: "This lecture was not found",
    });
  else
    res.status(200).json({
      status: "success",
      message: "This lecture is successfully updated",
    });
});
exports.deleteLecture = catchAsync(async (req, res, next) => {
  let id = req.params.id;
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
