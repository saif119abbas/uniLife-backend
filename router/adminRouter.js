const express = require("express");
const { upload } = require("../images/handleImag");
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
const {
  addMajor,
  addCatigory,
} = require("../contoller/adminController/postAction");
const {
  addFloor,
  addFaculty,
  addClassRoom,
} = require("../contoller/adminController/facultyAction");
const {
  validtaeAddRestaurant,
  validtaeEditRestaurant,
  validtaeAddDormitoryOwner,
  validtaeEditDormitoryOwner,
  validtaeSignup,
  validtaeAddFaculty,
  validtaeAddFloor,
  validtaeAddClassroom,
} = require("../validation/validator");
const { addAdmin } = require("../contoller/adminController/addAdmin");
const { adminPermission } = require("../permission");
const { protect } = require("../contoller/userController/authController");
router.post(
  "/restaurants/:userId",
  protect,
  adminPermission,
  upload.single("image"),
  validtaeAddRestaurant,
  addRestaurant,
  createMenu
);
router.post(
  "/addAdmin",
  /*protect, adminPermission, validtaeSignup,*/
  addAdmin
);
router.patch(
  "/restaurants/:userId/:restaurantId",
  protect,
  adminPermission,
  validtaeEditRestaurant,
  editRestaurant
);
router.delete(
  "/restaurants/:userId/:restaurantId",
  protect,
  adminPermission,
  deleteMenu,
  deleteRestaurant
);

router.post(
  "/dormitoryowner/:userId",
  protect,
  adminPermission,
  validtaeAddDormitoryOwner,
  addDormitoryOwner
);
router.patch(
  "/dormitoryowner/:userId/:dormitoryId",
  protect,
  adminPermission,
  validtaeEditDormitoryOwner,
  editDormitoryOwner
);
router.delete(
  "/dormitoryowner/:userId/:dormitoryId",
  protect,
  adminPermission,
  deleteDormitoryOwner
);
router.get(
  "/dormitoryowner/:userId",
  protect,
  adminPermission,
  getDormitoryOwners
);
router.post("/major/:userId", protect, adminPermission, addMajor);
router.post("/catigory/:userId", protect, adminPermission, addCatigory);
router.post(
  "/faculty/:userId",
  protect,
  adminPermission,
  validtaeAddFaculty,
  addFaculty
);
router.post(
  "/floor/:userId/:facultyId",
  protect,
  adminPermission,
  validtaeAddFloor,
  addFloor
);
router.post(
  "/class/:userId/:floorId",
  protect,
  adminPermission,
  validtaeAddClassroom,
  addClassRoom
);
module.exports = router;
