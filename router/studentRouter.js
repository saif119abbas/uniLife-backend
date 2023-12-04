const express = require("express");
const multer = require("multer");
const { upload } = require("../images/handleImag");
const {
  signup,
  verify,
  protect,
} = require("../contoller/userController/authController");

const {
  createSchedule,
  addLecture,
  deleteLecture,
  editLecture,
  getLectures,
} = require("../contoller/studentController/scheduleController");
const { lectureCheck } = require("../MiddleWare/lectureMiddleWare");
const {
  getAllDormitoryPost,
  getPost,
} = require("../contoller/dormitory/externalController");
const {
  createPost,
  getPostStudent,
  reservesdPost,
  searchPost,
} = require("../contoller/studentController/postController");
const {
  validtaeAddLecture,
  validtaeEditLecture,
  validtaeCreateOrder,
  validtaeSignup,
} = require("../validation/validator");
const { getMenu } = require("../contoller/restaurant/restaurantController");
const {
  createOrder,
  getOrders,
  getOffers,
  getPoular,
} = require("../contoller/studentController/studnetOrder");
const {
  sendMessage,
  getMessage,
} = require("../contoller/studentController/messageController");
const { studentPermission } = require("../permission");
const router = express.Router();
//router.use(protect);
router.post("/signup", validtaeSignup, signup);
router.post("/verify", verify, createSchedule);
router.post(
  "/addLecture/:userId",
  protect,
  studentPermission,
  validtaeAddLecture,
  addLecture
);
router.delete(
  "/deleteLecture/:lectureId/:userId",
  protect,
  studentPermission,
  lectureCheck,
  deleteLecture
);
router.patch(
  "/editLecture/:lectureId/:userId",
  protect,
  studentPermission,
  lectureCheck,
  validtaeEditLecture,
  editLecture
);
router.get("/getLectures/:userId", protect, studentPermission, getLectures);
router.get("/menu/:restaurantId/:userId", protect, studentPermission, getMenu);
router.post(
  "/createOrder/:userId",
  protect,
  studentPermission,
  validtaeCreateOrder,
  createOrder
);
router.get("/orders/:userId", protect, studentPermission, getOrders);
router.get("/poularmeat/:userId", protect, studentPermission, getPoular);
router.get(
  "/offer/:userId/:restaurantId",
  protect,
  studentPermission,
  getOffers
);
router.get(
  "/dormitoryposts/:userId",
  protect,
  studentPermission,
  getAllDormitoryPost
);
router.get(
  "/dormitoryposts/:userId/:dorimtoryId",
  protect,
  studentPermission,
  getPost
);
router.post(
  "/post/:userId",
  upload.single("image"),
  protect,
  studentPermission,
  createPost
);
router.get("/post/all/:userId", protect, studentPermission, getPostStudent);
router.patch(
  "/post/reserve/:userId/:postId",
  protect,
  studentPermission,
  reservesdPost
);
router.get("/post/search/:userId", protect, studentPermission, searchPost);
router.post(
  "/messgae/:senderId/:receiverId",
  protect,
  studentPermission,
  sendMessage
);
router.get(
  "/messgae/:senderId/:receiverId",
  protect,
  studentPermission,
  getMessage
);

module.exports = router;
