const express = require("express");
const { protect } = require("../contoller/userController/authController");
const {
  addFoodItem,
  editFoodItem,
  deleteFoodItem,
  getOrders,
  endOrder,
  getMenu,
} = require("../contoller/restaurant/restaurantController");
const { addOffer } = require("../contoller/restaurant/offerController");
const {
  validtaeAddFoodItem,
  validtaeEditFoodItem,
  validtaeAddOffer,
} = require("../validation/validator");
const { restaurantPermission } = require("../permission");
const { restaurantCheckOrder } = require("../MiddleWare/resturantMiddleWare");
const { upload } = require("../images/handleImag");
const router = express.Router();
router.get("/menu/:userId", protect, restaurantPermission, getMenu);
router.post(
  "/addFoodItem/:userId",
  protect,
  restaurantPermission,
  validtaeAddFoodItem,
  upload.single("image"),
  addFoodItem
);
router.patch(
  "/editFoodItem/:foodId/:userId",
  protect,
  restaurantPermission,
  validtaeEditFoodItem,
  upload.single("image"),
  editFoodItem
);
router.delete(
  "/deleteFoodItem/:foodId/:userId",
  protect,
  restaurantPermission,
  deleteFoodItem
);
router.get(
  "/orders/restaurant/:userId",
  protect,
  restaurantPermission,
  getOrders
);
router.patch(
  "/addoffer/:userId/:foodId",
  protect,
  restaurantPermission,
  validtaeAddOffer,
  addOffer
);
router.patch(
  "/endorder/:userId/:orderId",
  protect,
  restaurantPermission,
  restaurantCheckOrder,
  endOrder
);
module.exports = router;
