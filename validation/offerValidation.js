const Joi = require("@hapi/joi");
exports.addOfferValidation = Joi.object({
  offerPrice: Joi.number()
    .required()
    .invalid()
    .error(new Error("❌ Please enter your the offer price")),
  offerDesc: Joi.string()
    .required()
    .error(new Error("❌ Please enter your the offer description")),
});
