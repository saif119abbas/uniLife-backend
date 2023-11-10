const Joi = require("@hapi/joi");
exports.signupValidation = Joi.object({
  username: Joi.string()
    .required()
    .error(new Error("❌ Please enter your username"))
    .min(3)
    .message("❌ Too Short!")
    .max(25)
    .message("❌ Too Long!"),
  email: Joi.string()
    .required()
    .error(new Error("❌ Please enter your email"))
    .pattern(/s\d{8}@stu.najah.edu$/)
    .message("❌ You must use a Najah student email"),
  password: Joi.string()
    .required()
    .error(new Error("❌ Please enter your password"))
    .min(8)
    .message("❌ Password should contain at least 8 characters"),
  confirmPassword: Joi.string()
    .required()
    .error(new Error("❌ Please enter  confiermed password"))
    .min(8)
    .message("❌ Password should contain at least 8 characters"),
  phoneNum: Joi.string()
    .required()
    .error(new Error("❌ Please enter your phone number"))
    .pattern(/\d/)
    .message("❌ Use digits only")
    .min(10)
    .message("❌ Must be exactly 10 digits")
    .max(10)
    .message("❌ Must be exactly 10 digits"),
});
exports.loginValidation = Joi.object({
  email: Joi.string()
    .required()
    .pattern(/(s\d{8}@stu.najah.edu$)|(\w@gmail.com)/)
    .message("❌ You must use invalid email"),
  password: Joi.string()
    .required()
    .min(8)
    .message("❌ Password should contain at least 8 characters"),
});
