const Joi = require("@hapi/joi");
exports.signupValidation = Joi.object({
  username: Joi.string()
    .required("You must provide your user name")
    .min(3)
    .message("❌ Too Short!")
    .max(25)
    .message("❌ Too Long!"),
  email: Joi.string()
    .required("You must provide your email address")
    .pattern(/s\d{8}@stu.najah.edu$/)
    .message("❌ You must use a Najah student email"),
  password: Joi.string()
    .required("You must provide a password")
    .min(8)
    .message("❌ Password should contain at least 8 characters"),
  confirmPassword: Joi.string()
    .required("You must provide a password")
    .min(8)
    .message("❌ Password should contain at least 8 characters"),
  phoneNum: Joi.string()
    .required("❌ Please enter your phone number")
    .pattern(/\d/)
    .message("❌ Use digits only")
    .min(10)
    .message("❌ Must be exactly 10 digits")
    .max(10)
    .message("❌ Must be exactly 10 digits"),
});
exports.loginValidation = Joi.object({
  email: Joi.string()
    .required("You must provide your email address")
    .pattern(/s\d{8}@stu.najah.edu$/)
    .message("❌ You must use a Najah student email"),
  password: Joi.string()
    .required("You must provide a password")
    .min(8)
    .message("❌ Password should contain at least 8 characters"),
});
