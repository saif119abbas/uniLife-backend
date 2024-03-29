const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const { schedule, lecture, student, user, FCM } = require("../../models");
const cron = require("node-cron");
const { Op } = require("sequelize");
const { pushNotification } = require("../../notification");
exports.createSchedule = catchAsync(async (req, res, next) => {
  try {
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
  } catch (err) {
    return res.status(500).json({
      status: "failed",
      message: "Internal Server error",
    });
  }
});
exports.addLecture = catchAsync(async (req, res, next) => {
  try {
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
          throw err;
        });
    }
  } catch (err) {
    return res.status(500).json({
      status: "failed",
      message: "Internal Server error",
    });
  }
});
exports.editLecture = catchAsync(async (req, res, next) => {
  try {
    const data = req.body;

    const id = req.params.id;
    await lecture
      .update(data, { where: { id } })
      .then((count) => {
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
      })
      .catch(err);
    {
      throw err;
    }
  } catch (err) {
    return res.status(500).json({
      status: "failed",
      message: "Internal Server error",
    });
  }
});
exports.deleteLecture = catchAsync(async (req, res, next) => {
  try {
    let id = req.params.id;
    console.log("Lecture ID=", id);
    if (!id)
      return next(new AppError("You need to provide lecture to delete", 400));
    id = parseInt(id);
    lecture
      .destroy({ where: { id } })
      .then((deleteCount) => {
        if (deleteCount > 1)
          return next(
            new AppError("Somethig went wrong please try again", 500)
          );
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
        throw err;
      });
  } catch (err) {
    return res.status(500).json({
      status: "failed",
      message: "Internal Server error",
    });
  }
});
exports.getLectures = async (req, res) => {
  const userId = req.params.userId;
  try {
    const data = await new Promise((resolve, reject) => {
      student
        .findOne({
          attributes: ["id"],
          where: { userId },
          include: {
            model: schedule,
            attributes: ["scheduleId"],
            include: {
              model: lecture,
              attributes: [
                "id",
                "classNumber",
                "Name",
                "startTime",
                "endTime",
                "day",
              ],
            },
          },
        })
        .then((record) => {
          resolve(record);
        })
        .catch((err) => {
          reject(err);
        });
    });
    const {
      schedule: { lectures },
    } = data;

    return res.status(200).json(lectures);
  } catch (err) {
    console.log(err);
    return res.status(200).json({
      status: "failed",
      message: "Internal Server Error",
    });
  }
};
//
cron.schedule("*/5 * * * *", async () => {
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  try {
    const currentDateTime = new Date();

    const dayOfWeek = daysOfWeek[currentDateTime.getDay()];
    const lectures = await lecture.findAll({
      where: {
        day: {
          [Op.like]: `%${dayOfWeek}%`,
        },
      },
      attributes: ["classNumber", "Name", "startTime", "endTime", "id"],
      include: [
        {
          model: schedule,
          attributes: ["studentId"],
          include: [
            {
              model: student,
              attributes: ["id", "userId"],
              include: [
                {
                  model: FCM,
                  attributes: ["id", "token"],
                },
              ],
            },
          ],
        },
      ],
    });

    lectures.forEach(async (item) => {
      const lecture = item.dataValues;
      const {
        startTime,
        Name,
        schedule: {
          student: { id, FCMs },
        },
      } = lecture;
      console.log(FCMs);
      const notificationTime = new Date();
      const [Hours, Minutes] = startTime.split(":");
      const LecHours = parseInt(Hours);
      const LecMinutes = parseInt(Minutes);

      const currHour = notificationTime.getHours();
      const currMinute = notificationTime.getMinutes();
      const result = compareTimes(LecHours, LecMinutes, currHour, currMinute);
      console.log(LecHours, LecMinutes, currHour, currMinute);
      console.log(result);

      if (result <= 5 && result > 0) {
        const title = `${Name} Lecture`;
        const body = `${Name} lecture will start in ${result} minutes`;
        console.log("Sending notification");
        if (FCMs.length > 0)
          await pushNotification(FCMs[0].dataValues.token, title, body);
      }
      // if (notificationTime.getTime() <= currentDateTime.getTime()) {
      //   const title = `${Name} lecture`;
      //   const body = `${Name} lecture will start at ${startTime}`;
      //   console.log("Sending notification");
      //   await pushNotification(id, title, body);
      // }
    });
  } catch (error) {
    console.error("Error scheduling notifications:", error);
  }
});
function compareTimes(hours1, minutes1, hours2, minutes2) {
  const time1InMinutes = hours1 * 60 + minutes1;
  const time2InMinutes = hours2 * 60 + minutes2;

  if (time1InMinutes < time2InMinutes) {
    return -1;
  } else if (time1InMinutes > time2InMinutes) {
    return time1InMinutes - time2InMinutes;
  } else {
    return 0; // Both times are equal
  }
}
