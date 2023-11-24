const Joi = require("@hapi/joi");
exports.scheduleValidation = Joi.object({
  status: Joi.string().required(
    new Error("You must provide the status of the schedule")
  ),
});
exports.addLectureValidation = Joi.object({
  classNumber: Joi.string()
    .required()
    .error(new Error("❌ Please enter class number")),
  Name: Joi.string()
    .required()
    .error(new Error("You must provide the name of the lecture")),
  startTime: Joi.string()
    .required()
    .error(new Error("❌ Please enter start time of the lecture")),
  endTime: Joi.string()
    .required()
    .error(new Error("❌ Please enter end time of the lecture")),
  day: Joi.array().items(
    Joi.string()
      .required()
      .error(new Error("❌ Please enter the day of the lecture"))
  ),
});
exports.editLectureValidation = Joi.object({
  classNumber: Joi.string(),
  Name: Joi.string(),
  startTime: Joi.string(),
  endTime: Joi.string(),
  day: Joi.string(),
})
  .min(1)
  .message("provide the inforamtiom you want to edit");
