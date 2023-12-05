const Joi = require("@hapi/joi");
exports.addFacultyValidation = Joi.object({
  name: Joi.string()
    .required()
    .min(3)
    .message("❌ Too Short!")
    .max(25)
    .message("❌ Too Long!"),
  facultyNumber: Joi.string()
    .required()
    .min(1)
    .message("❌ Too Short!")
    .max(3)
    .message("❌ Too Long!"),
});
exports.addFloorValidation = Joi.object({
  name: Joi.string()
    .required()
    .min(1)
    .message("❌ Too Short!")
    .max(4)
    .message("❌ Too Long!"),
});
exports.addClassroomValidation = Joi.object({
  number: Joi.string()
    .required()
    .min(1)
    .message("❌ Too Short!")
    .max(4)
    .message("❌ Too Long!"),
});
