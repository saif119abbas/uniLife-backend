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
  reportedPost,
  removeMajor,
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
const {
  getStudents,
  blockedStudent,
} = require("../contoller/adminController/studentAction");
const {
  totalUsers,
  totalPost,
  topRestaurant,
  popularRestaurant,
  dormitoryPostCount,
  reportedPostCount,
} = require("../contoller/adminController/dashboardController");
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
const {
  searchPostByDate,
  getLastPosts,
} = require("../contoller/adminController/postAction");
const { addAdmin } = require("../contoller/adminController/addAdmin");
const { adminPermission } = require("../permission");
const { protect } = require("../contoller/userController/authController");
const { floorFacultyCheck } = require("../MiddleWare/checkFloorFaculty");
const {
  addAds,
  getAdds,
  editAdds,
  removeAdds,
  getAllAdds,
} = require("../contoller/adminController/adsController");
router.post(
  "/restaurants/:userId",
  protect,
  adminPermission,
  upload.single("image"),
  validtaeAddRestaurant,
  addRestaurant,
  createMenu
);
router.post("/addAdmin", addAdmin);
router.patch(
  "/restaurants/:userId/:restaurantId",
  protect,
  adminPermission,
  upload.single("image"),
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
  upload.single("image"),
  validtaeAddDormitoryOwner,
  addDormitoryOwner
);
router.patch(
  "/dormitoryowner/:userId/:dormitoryId",
  protect,
  adminPermission,
  upload.single("image"),
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
router.delete("/major/:userId/:majorId", protect, adminPermission, removeMajor);
router.delete("/major/:userId/:majorId", protect, adminPermission, removeMajor);
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
router.patch(
  "/student/block/:userId/:studentId",
  protect,
  adminPermission,
  blockedStudent
);
router.get(
  "/post/search/admin/:userId",
  protect,
  adminPermission,
  searchPostByDate
);
router.get("/lastposts/:userId", protect, adminPermission, getLastPosts);
router.get("/report/:userId", protect, adminPermission, reportedPost);
router.get("/report/:userId", protect, adminPermission, reportedPost);
/* dashboard*/
router.get("/userjoin/:userId", protect, adminPermission, totalUsers);
router.get("/totalpost/:userId", protect, adminPermission, totalPost);
router.get(
  "/popularrestaurant/:userId",
  protect,
  adminPermission,
  popularRestaurant
);
router.get("/toprestaurant/:userId", protect, adminPermission, topRestaurant);
router.get(
  "/dormitorycount/:userId",
  protect,
  adminPermission,
  dormitoryPostCount
);
router.get(
  "/reportppostcount/:userId",
  protect,
  adminPermission,
  reportedPostCount
);
router.post(
  "/adds/:userId",
  protect,
  adminPermission,
  upload.single("image"),
  addAds
);
router.patch(
  "/adds/:userId/:adId",
  protect,
  adminPermission,
  upload.single("image"),
  editAdds
);
router.delete("/adds/:userId/:adId", protect, adminPermission, removeAdds);
router.get("/alladds/:userId", protect, adminPermission, getAllAdds);
module.exports = router;
