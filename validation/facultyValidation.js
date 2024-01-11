const Joi = require("@hapi/joi");
exports.addFacultyValidation = Joi.object({
  facultyName: Joi.string()
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
  coordinates: Joi.array().items(
    Joi.object({
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
      // Add more validation rules as needed for other properties in the 'locations' objects
    })
  ),
});
exports.addFloorValidation = Joi.object({
  name: Joi.string()
    .required()
    .min(1)
    .message("❌ Too Short!")
    .max(4)
    .message("❌ Too Long!"),
  reference: Joi.string().required(),
});
exports.addClassroomValidation = Joi.object({
  number: Joi.string()
    .required()
    .min(1)
    .message("❌ Too Short!")
    .max(4)
    .message("❌ Too Long!"),
});
