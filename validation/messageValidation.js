const Joi = require("@hapi/joi");

exports.sendMessageValidation = Joi.object({
  text: Joi.string(),
  image: Joi.string(),
})
  .min(1)
  .message("❌ Please enter your message");
