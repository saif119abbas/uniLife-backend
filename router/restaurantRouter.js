const express = require("express");
const { login, protect } = require("../contoller/authController");
const {
  forrgetPassword,
  verifyUpdatePassword,
  restPassword,
} = require("../contoller/forgetPassword");
const {
  addFoodItem,
  editFoodItem,
  deleteFoodItem,
} = require("../contoller/restaurant/restaurantController");
const {
  validtaeAddFoodItem,
  validtaeLogin,
  validtaeEditFoodItem,
} = require("../validation/validator");
const { restaurantPermission } = require("../permission");
const { upload } = require("../images/handleImag");
const router = express.Router();
router.post("/login", validtaeLogin, login);
router.post(
  "/addFoodItem",
  protect,
  restaurantPermission,
  validtaeAddFoodItem,
  upload.single("image"),
  addFoodItem
);
router.patch(
  "/editFoodItem/:foodId",
  protect,
  restaurantPermission,
  validtaeEditFoodItem,
  upload.single("image"),
  editFoodItem
);
router.delete(
  "/deleteFoodItem/:foodId",
  protect,
  restaurantPermission,
  deleteFoodItem
);
module.exports = router;
