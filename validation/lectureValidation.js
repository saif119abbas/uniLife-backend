const Joi = require("@hapi/joi");
exports.scheduleValidation = Joi.object({
  status: Joi.string().required(
    new Error("You must provide the status of the schedule")
  ),
});
exports.addLectureValidation = Joi.object({
  lectureId: Joi.number()
    .invalid()
    .error(new Error("lecture id must be a number"))
    .required("You must provide your uneversity id "),
  classNumber: Joi.string().required("You must provide your class number"),
  Name: Joi.string().required("You must provide the name of the lecture"),
  startTime: Joi.string().required(
    "You must provide the start time of the lecture"
  ),
  endTime: Joi.string().required(
    "You must provide the end time of the lecture"
  ),
  day: Joi.string().required("You must provide the day of the lecture"),
});
exports.editLectureValidation = Joi.object({
  lectureId: Joi.number()
    .invalid()
    .error(new Error("lecture id must be a number")),
  classNumber: Joi.string(),
  Name: Joi.string(),
  startTime: Joi.string(),
  endTime: Joi.string(),
  day: Joi.string(),
})
  .min(1)
  .message("provide the inforamtiom you want to edit");
