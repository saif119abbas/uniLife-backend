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
const { protect } = require("../contoller/userController/authController");
router.post(
  "/addRestaurant/:adminId",
  protect,
  adminPermission,
  validtaeAddRestaurant,
  addRestaurant,
  createMenu
);
router.post("/addAdmin", protect, adminPermission, validtaeSignup, addAdmin);
router.patch(
  "/editRestaurant/:userId/:adminId",
  protect,
  adminPermission,
  validtaeEditRestaurant,
  editCardID,
  editRestaurant
);
router.delete(
  "/deleteRestaurant/:userId/:adminId",
  protect,
  adminPermission,
  deleteMenu,
  deleteRestaurant
);

router.post(
  "/addDormitoryOwner/:adminId",
  protect,
  adminPermission,
  validtaeAddDormitoryOwner,
  addDormitoryOwner
);
router.patch(
  "/editDormitoryOwner/:userId/:adminId",
  protect,
  adminPermission,
  validtaeEditDormitoryOwner,
  editDormitoryOwner
);
router.delete(
  "/deleteDormitoryOwner/:userId/:adminId",
  protect,
  adminPermission,
  deleteDormitoryOwner
);
router.get(
  "/getAllDormitories/:adminId",
  protect,
  adminPermission,
  getDormitoryOwners
);
router.get(
  "/getAllRestarunts/:adminId",
  protect,
  adminPermission,
  getResturants
);
module.exports = router;
