const Joi = require("@hapi/joi");
const rooms = Joi.object({
  type: Joi.string().required(),
  rent: Joi.number().required(),
  numberOfPerson: Joi.number().required(),
  avilableSeat: Joi.number().required(),
});
exports.createRoomValidation = Joi.array().required().items(rooms);
