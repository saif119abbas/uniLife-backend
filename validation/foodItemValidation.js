const Joi = require("@hapi/joi");
exports.addFoodItemValidation = Joi.object({
  description: Joi.string()
    .required()
    .error(new Error("❌ Please add a description of this item")),
  price: Joi.number()
    .required()
    .invalid()
    .error(new Error("❌ Use a number only")),
  nameOfFood: Joi.string()
    .required()
    .min(4)
    .message("❌ too short name of food")
    .max(25)
    .message("❌ too long name of food"),
  category: Joi.string()
    .required()
    .min(4)
    .message("❌ too short")
    .max(10)
    .message("❌ too long"),
});
exports.editFoodItemValidation = Joi.object({
  description: Joi.string(),
  price: Joi.number().invalid().error(new Error("❌ Use a number only")),
  nameOfFood: Joi.string()
    .min(4)
    .message("❌ too short name of food")
    .max(25)
    .message("❌ too long name of food"),
  category: Joi.string()
    .min(4)
    .message("❌ too short")
    .max(10)
    .message("❌ too long"),
})
  .min(1)
  .message("provide the inforamtiom you want to edit");
