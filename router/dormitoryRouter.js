const express = require("express");
const router = express.Router();
const {
  addDormitoryPost,
  deleteDormitoryPost,
  assignUser,
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
module.exports = router;
