const express = require("express");
const { protect } = require("../contoller/userController/authController");
const {
  addFoodItem,
  editFoodItem,
  deleteFoodItem,
  getMenu,
  getRating,
  setOpened,
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
  totalRevenu,
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
router.get(
  "/weeklydashboard/:userId",
  protect,
  restaurantPermission,
  weeklyDashboard
);
router.get(
  "/dailyrevenue/:userId",
  protect,
  restaurantPermission,
  dailyDashboard
);
router.get("/totalpeople/:userId", protect, restaurantPermission, totalPeople);
router.get("/newcustomer/:userId", protect, restaurantPermission, newCustomer);
router.get("/totalorder/:userId", protect, restaurantPermission, totalOrder);
router.get(
  "/dashboard/food/:userId",
  protect,
  restaurantPermission,
  foodLastWeek
);
router.get("/lastreviwer/:userId", protect, restaurantPermission, lastReviewer);
router.get("/totalrevenu/:userId", protect, restaurantPermission, totalRevenu);
router.get("/rating/:userId", protect, restaurantPermission, getRating);
router.patch(
  "/restaurantstatus/:userId",
  protect,
  restaurantPermission,
  setOpened
);
module.exports = router;
