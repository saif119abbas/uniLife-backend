const express = require("express");
const { upload } = require("../images/handleImag");
const {
  signup,
  verify,
  protect,
  editProfile,
  getPofile,
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
  unReservesdPost,
  searchPost,
  getMyPost,
  deletePost,
  editPost,
} = require("../contoller/studentController/postController");
const {
  validtaeAddLecture,
  validtaeEditLecture,
  validtaeCreateOrder,
  validtaeSignup,
  validtaeSendMessage,
} = require("../validation/validator");
const { getMenu } = require("../contoller/restaurant/restaurantController");
const {
  createOrder,
  getOrders,
  getOffers,
  getPoular,
  rate,
} = require("../contoller/studentController/studnetOrder");
const {
  sendMessage,
  getMessage,
  getMyMessage,
} = require("../contoller/studentController/messageController");
const {
  getLocation,
} = require("../contoller/studentController/locationController");
const { studentPermission } = require("../permission");
const router = express.Router();
//router.use(protect);
router.post("/signup", upload.single("image"), validtaeSignup, signup);
router.post("/verify", verify, createSchedule);
router.patch("/profile/:userId", protect, editProfile);
router.get("/profile/:userId", protect, getPofile);
router.post(
  "/addLecture/:userId",
  protect,
  studentPermission,
  validtaeAddLecture,
  addLecture
);
router.delete(
  "/lecture/:userId/:id",
  protect,
  studentPermission,
  lectureCheck,
  deleteLecture
);
router.patch(
  "/lecture/:userId/:id",
  protect,
  studentPermission,
  lectureCheck,
  validtaeEditLecture,
  editLecture
);
router.get("/lecture/:userId", protect, studentPermission, getLectures);
router.get("/menu/:restaurantId/:userId", protect, studentPermission, getMenu);
router.post(
  "/order/:userId",
  protect,
  studentPermission,
  validtaeCreateOrder,
  createOrder
);
router.get("/orders/:userId", protect, studentPermission, getOrders);
router.patch("/orders/:userId/:orderId", protect, studentPermission, rate);
router.get("/poularmeal/:userId", protect, studentPermission, getPoular);
router.get(
  "/offer/:userId/:restaurantId",
  protect,
  studentPermission,
  getOffers
);
router.get(
  "/dormitory/:userId",
  protect,
  studentPermission,
  getAllDormitoryPost
);
router.get(
  "/dormitory/:userId/:dorimtoryId",
  protect,
  studentPermission,
  getPost
);
router.post(
  "/post/:userId",
  protect,
  studentPermission,
  upload.single("image"),
  createPost
);
router.get(
  "/post/all/:userId/:pageNumber",
  protect,
  studentPermission,
  getPostStudent
);
router.get("/post/:userId", protect, studentPermission, getMyPost);
router.patch(
  "/post/reserve/:userId/:postId",
  protect,
  studentPermission,
  reservesdPost
);
router.patch(
  "/post/unreserve/:userId/:postId",
  protect,
  studentPermission,
  upload.single("image"),
  unReservesdPost
);
router.get("/post/search/:userId", protect, studentPermission, searchPost);
router.delete("/post/:userId/:postId", protect, studentPermission, deletePost);
router.patch(
  "/post/:userId/:postId",
  protect,
  studentPermission,
  upload.single("image"),
  editPost
);
router.post(
  "/message/:userId/:receiverId",
  protect,
  studentPermission,
  validtaeSendMessage,
  upload.single("image"),
  sendMessage
);
router.get(
  "/message/:userId/:receiverId",
  protect,
  studentPermission,
  getMessage
);
router.get("/message/:userId", protect, studentPermission, getMyMessage);
router.get("/location/:userId", protect, studentPermission, getLocation);

module.exports = router;
