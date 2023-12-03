const express = require("express");
const router = express.Router();
const {
  addRestaurant,
  editRestaurant,
  deleteRestaurant,
  deleteMenu,
  createMenu,
} = require("../contoller/adminController/restaurantActions");
const {
  addDormitoryOwner,
  editDormitoryOwner,
  deleteDormitoryOwner,
  editSSN,
  getDormitoryOwners,
} = require("../contoller/adminController/dormitoryActions");
const { addMajor } = require("../contoller/adminController/majorAction");
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
  "/restaurant/:adminId",
  protect,
  adminPermission,
  validtaeAddRestaurant,
  addRestaurant,
  createMenu
);
router.post("/addAdmin", protect, adminPermission, validtaeSignup, addAdmin);
router.patch(
  "/restaurants/:adminId/:userId",
  protect,
  adminPermission,
  validtaeEditRestaurant,
  editRestaurant
);
router.delete(
  "/restaurants/:adminId/:userId",
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
router.post("/major/:adminId", protect, adminPermission, addMajor);
module.exports = router;
