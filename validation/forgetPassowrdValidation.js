const Joi = require("@hapi/joi");
exports.forgetPasswordValidation = Joi.object({
  email: Joi.string()
    .required()
    .pattern(/s\d{8}@stu.najah.edu$/)
    .message("❌ You must use a Najah student email"),
});
exports.resetPasswordValidation = Joi.object({
  newPassword: Joi.string()
    .required()
    .min(8)
    .message("❌ Password should contain at least 8 characters"),
  confirmedPassword: Joi.string().required("You must provide a password"),
});
exports.verifyUpdatePasswordValidation = Joi.object({
  verifyCode: Joi.string()
    .required()
    .min(6)
    .message("❌ verify code should contain just 8 characters")
    .max(6)
    .message("❌ verify code should contain just 8 characters"),
});
