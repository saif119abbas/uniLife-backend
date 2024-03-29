const Joi = require("@hapi/joi");
exports.addResturantValidation = Joi.object({
  username: Joi.string()
    .required("❌ Please enter the name of the restaurant")
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
  restaurantDesc: Joi.string().required(),
});
exports.editRestaurantValidation = Joi.object({
  username: Joi.string()
    .min(3)
    .message("❌ Too Short!")
    .max(25)
    .message("❌ Too Long!"),
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
