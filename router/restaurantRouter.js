const express = require("express");
const { protect } = require("../contoller/userController/authController");
const {
  addFoodItem,
  editFoodItem,
  deleteFoodItem,
  getMenu,
  getRating,
} = require("../contoller/restaurant/restaurantController");
const {
  getOrders,
  updateOrder,
  weeklyDashboard,
  dailyDashboard,
  totalPeople,
  newCustomer,
  foodLastWeek,
  lastReviewer,
  totalOrder,
  cancelOrder,
} = require("../contoller/restaurant/orderController");
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
  "/menu/:userId",
  protect,
  restaurantPermission,
  validtaeAddFoodItem,
  upload.single("image"),
  addFoodItem
);
router.patch(
  "/menu/:foodId/:userId",
  protect,
  restaurantPermission,
  validtaeEditFoodItem,
  upload.single("image"),
  editFoodItem
);
router.delete(
  "/menu/:foodId/:userId",
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
  "/order/:userId/:orderId",
  protect,
  restaurantPermission,
  updateOrder
);
router.patch(
  "/order/cancel/:userId/:orderId",
  protect,
  restaurantPermission,
  cancelOrder
);
router.get("/weeklydashboard/:userId", protect, weeklyDashboard);
router.get("/dailyrevenue/:userId", protect, dailyDashboard);
router.get("/totalpeople/:userId", protect, totalPeople);
router.get("/newcustomer/:userId", protect, newCustomer);
router.get("/totalorder/:userId", protect, totalOrder);
router.get("/dashboard/food/:userId", protect, foodLastWeek);
router.get("/lastreviwer/:userId", protect, lastReviewer);
router.get("/rating/:userId", protect, getRating);
module.exports = router;
