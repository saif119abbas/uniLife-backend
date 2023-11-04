const Joi = require("@hapi/joi");
exports.forgetPasswordValidation = Joi.object({
  email: Joi.string()
    .required()
    .error(new Error("❌ Please enter your email"))
    .pattern(/s\d{8}@stu.najah.edu$/)
    .message("❌ You must use a Najah student email"),
});
exports.resetPasswordValidation = Joi.object({
  newPassword: Joi.string()
    .required()
    .error(new Error("❌ Please enter your password"))
    .min(8)
    .message("❌ Password should contain at least 8 characters"),
  confirmedPassword: Joi.string().required("You must provide a password"),
});
