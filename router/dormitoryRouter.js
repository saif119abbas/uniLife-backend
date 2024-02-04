const express = require("express");
const router = express.Router();
const {
  addDormitoryPost,
  deleteDormitoryPost,
  assignUser,
  editDormitoryPost,
  editRoom,
  addRoom,
  deleteRoom,
} = require("../contoller/dormitory/dormitoryController");
const { upload } = require("../images/handleImag");
const { getMyPosts } = require("../contoller/dormitory/externalController");
const { protect } = require("../contoller/userController/authController");
const {
  validtaeAddDormitoryPost,
  validtaeEditDormitoryPost,
  validtaeAddRooms,
} = require("../validation/validator");
const { dormitoryPermission } = require("../permission");

const { dormitoryPostCheck } = require("../MiddleWare/dormitoryMiddleWare");
const {
  getStatistics,
  topPosts,
} = require("../contoller/dormitory/dashboardController");
router.post(
  "/dormitory/:userId",
  protect,
  dormitoryPermission,
  upload.array("image"),
  validtaeAddDormitoryPost,
  validtaeAddRooms,
  addDormitoryPost
);
router.delete(
  "/dormitory/:userId/:dormitoryPostId",
  protect,
  dormitoryPermission,
  deleteDormitoryPost
);
router.get("/mydormitory/:userId", protect, dormitoryPermission, getMyPosts);
router.patch(
  "/usertoroom/:userId/:roomId",
  protect,
  dormitoryPermission,
  assignUser
);
router.patch(
  "/dormitory/:userId/:dormitoryPostId",
  protect,
  dormitoryPermission,
  upload.single("image"),
  editDormitoryPost
);
router.patch(
  "/room/:userId/:dormitoryPostId/:roomId",
  protect,
  dormitoryPermission,
  upload.single("image"),
  editRoom
);
router.post(
  "/room/:userId/:dormitoryPostId",
  protect,
  dormitoryPermission,
  upload.single("image"),
  addRoom
);
router.delete(
  "/room/:userId/:dormitoryPostId/:roomId",
  protect,
  dormitoryPermission,
  deleteRoom
);
router.get("/dashboard/:userId", protect, dormitoryPermission, getStatistics);
router.get("/topposts/:userId", protect, dormitoryPermission, topPosts);
module.exports = router;
