const Joi = require("@hapi/joi");
exports.addPostValidtaion = Joi.object({
  description: Joi.string()
    .required()
    .error(new Error("❌ Please add a description of this item")),
  location: Joi.string()
    .required()
    .min(4)
    .message("❌ too short name of food")
    .max(50)
    .message("❌ too long name of food"),
});
exports.editPostValidtaion = Joi.object({
  description: Joi.string().error(
    new Error("❌ Please add a description of this item")
  ),
  location: Joi.string()
    .min(4)
    .message("❌ too short name of food")
    .max(50)
    .message("❌ too long name of food"),
})
  .min(1)
  .message("provide the inforamtiom you want to edit");
