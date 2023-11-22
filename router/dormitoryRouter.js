const express = require("express");
const router = express.Router();
const {
  addDormitoryPost,
  deleteDormitoryPost,
} = require("../contoller/dormitory/dormitoryController");
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
  "/adddormitorypost/:userId",
  protect,
  dormitoryPermission,
  validtaeAddDormitoryPost,
  validtaeAddRooms,
  addDormitoryPost
);
router.delete(
  "/deletedormitroypost/:userId/:dorimtoryPostid",
  protect,
  dormitoryPermission,
  dormitoryPostCheck,
  deleteDormitoryPost
);
router.get(
  "/mydormitorypost/:userId",
  protect,
  dormitoryPermission,
  getMyPosts
);
module.exports = router;
