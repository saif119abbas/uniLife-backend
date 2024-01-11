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
  getFaculties,
  getFloors,
  getClasses,
  editFaculty,
  deleteFaculty,
  deleteFloor,
  deleteClasses,
} = require("../contoller/adminController/facultyAction");
const { getStudents } = require("../contoller/adminController/studentAction");
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
const { floorFacultyCheck } = require("../MiddleWare/checkFloorFaculty");
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
router.patch(
  "/faculty/:userId/:facultyId",
  protect,
  adminPermission,
  editFaculty
);
router.delete(
  "/faculty/:userId/:facultyId",
  protect,
  adminPermission,
  deleteFaculty
);
router.get("/faculty/:userId", protect, adminPermission, getFaculties);
router.post(
  "/floor/:userId/:facultyId",
  protect,
  adminPermission,
  validtaeAddFloor,
  addFloor
);
router.delete(
  "/floor/:userId/:floorId/:facultyId",
  protect,
  adminPermission,
  deleteFloor
);
router.get("/floor/:userId/:facultyId", protect, adminPermission, getFloors);
router.post(
  "/class/:userId/:facultyId/:floorId",
  protect,
  adminPermission,
  validtaeAddClassroom,
  //floorFacultyCheck,
  addClassRoom
);
router.delete(
  "/class/:userId/:classId",
  protect,
  adminPermission,
  deleteClasses
);
router.get(
  "/class/:userId/:facultyId/:floorId",
  protect,
  adminPermission,
  getClasses
);
router.get("/student/:userId", protect, adminPermission, getStudents);

module.exports = router;
