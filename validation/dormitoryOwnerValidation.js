const Joi = require("@hapi/joi");
exports.scheduleValidation = Joi.object({
  status: Joi.string().required(
    new Error("You must provide the status of the schedule")
  ),
});
exports.addDormitoryOwnerValidation = Joi.object({
  SSN: Joi.number()
    .required()
    .invalid()
    .error(new Error("SSN must be a number")),
  username: Joi.string()
    .required()
    .error(new Error("❌ Please enter your username"))
    .min(3)
    .message("❌ Too Short!")
    .max(25)
    .message("❌ Too Long!"),
  email: Joi.string()
    .required()
    .pattern(/\w@gmail.com$/)
    .message("❌ You must use a gamil email"),
  password: Joi.string()
    .required()
    .min(8)
    .message("❌ Password should contain at least 8 characters"),
  confirmPassword: Joi.string()
    .required()
    .min(8)
    .message("❌ Password should contain at least 8 characters"),
  phoneNum: Joi.string()
    .required()
    .pattern(/\d/)
    .message("❌ Use digits only")
    .min(10)
    .message("❌ Must be exactly 10 digits")
    .max(10)
    .message("❌ Must be exactly 10 digits"),
});
exports.editDormitoryOwnerValidation = Joi.object({
  SSN: Joi.number().invalid().error(new Error("SSN must be a number")),
  email: Joi.string()
    .pattern(/\w@gmail.com$/)
    .message("❌ You must use a gamil email"),
  password: Joi.string()
    .min(8)
    .message("❌ Password should contain at least 8 characters"),
  confirmPassword: Joi.string()
    .when("password", {
      is: Joi.exist(),
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    })
    .min(8)
    .message("❌ Password should contain at least 8 characters"),
  phoneNum: Joi.string()
    .pattern(/\d/)
    .message("❌ Use digits only")
    .min(10)
    .message("❌ Must be exactly 10 digits")
    .max(10)
    .message("❌ Must be exactly 10 digits"),
})
  .min(1)
  .message("provide the inforamtiom you want to edit");
