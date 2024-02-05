const express = require("express");
const { upload } = require("../images/handleImag");
const {
  signup,
  verify,
  protect,
  editProfile,
  getPofile,
  logout,
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
  getPostForStudent,
  reservesdPost,
  unReservesdPost,
  getMyPost,
  deletePost,
  getMyReservePost,
  editPost,
  requestPost,
  getRequestPost,
  rejectPost,
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
  paypalOrder,
  paypalExecute,
} = require("../contoller/studentController/studnetOrder");
const {
  sendMessage,
  getMessage,
  getMyMessage,
} = require("../contoller/studentController/messageController");
const {
  getLocation,
} = require("../contoller/studentController/locationController");
const {
  createReport,
} = require("../contoller/studentController/reportController");
const {
  createEmergency,
  getMyRoom,
} = require("../contoller/studentController/emergencyController");
const {
  savePost,
  gtesSavePost,
  removeSaved,
  addView,
} = require("../contoller/studentController/savePostController");
const { studentPermission } = require("../permission");
const {
  getNotifications,
  getUnseenCount,
} = require("../contoller/studentController/notificationController");
const router = express.Router();
//router.use(protect);
router.post("/signup", validtaeSignup, signup);
router.delete("/logout/:userId", protect, studentPermission, logout);
router.post("/verify", verify, createSchedule);
router.patch("/profile/:userId", protect, upload.single("image"), editProfile);
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
//router.get("/menu/:restaurantId/:userId", protect, studentPermission, getMenu);
router.post(
  "/order/:userId",
  protect,
  studentPermission,
  validtaeCreateOrder,
  createOrder
);
router.get("/orders/:userId", protect, studentPermission, getOrders);
router.patch("/orders/:userId/:orderId", protect, studentPermission, rate);
router.get("/payment/order/cancel", (req, res) => {
  res.render("cancel");
});
router.get("/payment", (req, res) => {
  res.render("index");
});
router.post("/payment/order/:userId", paypalOrder);
router.get("/payment/order/success", paypalExecute);

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
router.get(
  "/post/student/:userId/:otherStudent",
  protect,
  studentPermission,
  getPostForStudent
);
router.get("/post/:userId", protect, studentPermission, getMyPost);
router.patch(
  "/post/reserve/:userId/:otherStudent/:postId",
  protect,
  studentPermission,
  reservesdPost
);
router.patch(
  "/post/reject/:userId/:otherStudent/:postId",
  protect,
  studentPermission,
  rejectPost
);
router.patch(
  "/post/unreserve/:userId/:postId",
  protect,
  studentPermission,
  upload.single("image"),
  unReservesdPost
);
router.get(
  "/reservedpost/:userId",
  protect,
  studentPermission,
  getMyReservePost
);
router.delete("/post/:userId/:postId", protect, studentPermission, deletePost);
router.patch(
  "/post/:userId/:postId",
  protect,
  studentPermission,
  upload.single("image"),
  editPost
);
router.post(
  "/request/:userId/:postId",
  protect,
  studentPermission,
  requestPost
);
router.patch(
  "/request/:userId/:postId",
  protect,
  studentPermission,
  requestPost
);
router.get("/request/:userId", protect, studentPermission, getRequestPost);
router.post(
  "/message/:userId/:receiverId",
  protect,
  studentPermission,
  //validtaeSendMessage,
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
router.post(
  "/report/:userId/:reportedUser/:postId",
  protect,
  studentPermission,
  createReport
);
router.post(
  "/emergency/:userId/:roomId",
  protect,
  studentPermission,
  createEmergency
);
router.get("/room/:userId", protect, studentPermission, getMyRoom);
router.post(
  "/domitorysave/:userId/:dormitoryPostId",
  protect,
  studentPermission,
  savePost
);
router.delete(
  "/domitorysave/:userId/:dormitoryPostId",
  protect,
  studentPermission,
  removeSaved
);
router.get("/domitorysave/:userId", protect, studentPermission, gtesSavePost);
router.get(
  "/notification/:userId",
  protect,
  studentPermission,
  getNotifications
);
router.get(
  "/notificationcount/:userId",
  protect,
  studentPermission,
  getUnseenCount
);

router.post(
  "/dormitorypost/view/:userId/:dormitoryPostId",
  protect,
  studentPermission,
  addView
);
module.exports = router;
