const express = require("express");
const router = express.Router();
const {
  addRestaurant,
  editRestaurant,
  deleteRestaurant,
  deleteMenu,
  createMenu,
  editCardID,
  getResturants,
} = require("../contoller/adminController/restaurantActions");
const {
  addDormitoryOwner,
  editDormitoryOwner,
  deleteDormitoryOwner,
  editSSN,
  getDormitoryOwners,
} = require("../contoller/adminController/dormitoryActions");
const {
  validtaeAddRestaurant,
  validtaeEditRestaurant,
  validtaeAddDormitoryOwner,
  validtaeEditDormitoryOwner,
  validtaeSignup,
} = require("../validation/validator");
const { addAdmin } = require("../contoller/adminController/addAdmin");
const { adminPermission } = require("../permission");
const { protect } = require("../contoller/authController");
router.post(
  "/addRestaurant",
  protect,
  adminPermission,
  validtaeAddRestaurant,
  addRestaurant,
  createMenu
);
router.post("/addAdmin", protect, adminPermission, validtaeSignup, addAdmin);
router.patch(
  "/editRestaurant/:userId",
  protect,
  adminPermission,
  validtaeEditRestaurant,
  editCardID,
  editRestaurant
);
router.delete(
  "/deleteRestaurant/:userId",
  protect,
  adminPermission,
  deleteMenu,
  deleteRestaurant
);

router.post(
  "/addDormitoryOwner",
  protect,
  adminPermission,
  validtaeAddDormitoryOwner,
  addDormitoryOwner
);
router.patch(
  "/editDormitoryOwner/:userId",
  protect,
  adminPermission,
  validtaeEditDormitoryOwner,
  editSSN,
  editDormitoryOwner
);
router.delete(
  "/deleteDormitoryOwner/:userId",
  protect,
  adminPermission,
  deleteDormitoryOwner
);
router.get("/getAllDormitories", protect, adminPermission, getDormitoryOwners);
router.get("/getAllRestarunts", protect, adminPermission, getResturants);
module.exports = router;
