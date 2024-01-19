const Joi = require("@hapi/joi");
exports.addPostValidtaion = Joi.object({
  services: Joi.string()
    .required()
    .error(new Error("❌ Please add a sevices of this item")),
  name: Joi.string()
    .required()
    .error(new Error("❌ Please add a name of dormitory")),
  lon: Joi.number()
    .required()
    .error(new Error("❌ Please add a lon of this item")),
  lat: Joi.number()
    .required()
    .error(new Error("❌ Please add a lat of this item")),
  distance: Joi.number()
    .required()
    .error(new Error("❌ Please add a distance of this item")),
  numberOfRoom: Joi.number()
    .required()
    .error(new Error("❌ Please add a numberOfRoom of this item")),
  gender: Joi.string()
    .required()
    .error(new Error("❌ Please add a gender of this item")),
});
exports.editPostValidtaion = Joi.object({
  services: Joi.string().error(
    new Error("❌ Please add a sevices of this item")
  ),
  lon: Joi.number().error(new Error("❌ Please add a lon of this item")),
  lat: Joi.number().error(new Error("❌ Please add a lat of this item")),
  distance: Joi.number().error(
    new Error("❌ Please add a distance of this item")
  ),
  numberOfRoom: Joi.number().error(
    new Error("❌ Please add a numberOfRoom of this item")
  ),
  gender: Joi.string().error(new Error("❌ Please add a gender of this item")),
})
  .min(1)
  .message("provide the inforamtiom you want to edit");
