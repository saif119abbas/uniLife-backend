const Joi = require("@hapi/joi");
const orderItem = Joi.object({
  foodId: Joi.number().required(),
  Qauntity: Joi.number().required(),
});
exports.createOrderValidation = Joi.array().items(orderItem);
