const Joi = require("@hapi/joi");
exports.studentValidator = Joi.object({
  unevirsityId: Joi.number()
    .invalid(new Error("unevirsity id must be number"))
    .required(new Error("You must provide your uneversity id ")),
  userName: Joi.string().required(new Error("You must provide your user name")),
  email: Joi.string()
    .required(new Error("You must provide your email address"))
    .email(new Error("Email not valid")),
  //.error(new Error("Email not valid")),
  password: Joi.string()
    .required(new Error("You must provide a password"))
    .min(8)
    .error(new Error("The password must be at least 8 characters")),
  phoneNumber: Joi.string().required(
    new Error("You must provide a phone number")
  ),
});
exports.scheduleValidator = Joi.object({
  status: Joi.string().required(
    new Error("You must provide the status of the schedule")
  ),
});
exports.lectureValidator = Joi.object({
  lectureId: Joi.number()
    .invalid(new Error("lecture id must be a number"))
    .required(new Error("You must provide your uneversity id ")),
  classNumber: Joi.string().required(
    new Error("You must provide your class number")
  ),
  Name: Joi.string().required(
    new Error("You must provide the name of the lecture")
  ),
  startTime: Joi.string().required(
    new Error("You must provide the start time of the lecture")
  ),
  endTime: Joi.string().required(
    new Error("You must provide the end time of the lecture")
  ),
  day: Joi.string().required(
    new Error("You must provide the day of the lecture")
  ),
});
