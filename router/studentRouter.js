const express = require("express");
const {
  login,
  signup,
  verify,
  protect,
} = require("../contoller/authController");
const {
  forrgetPassword,
  verifyUpdatePassword,
  restPassword,
} = require("../contoller/forgetPassword");
const {
  createSchedule,
  addLecture,
  deleteLecture,
  editLecture,
  getLectures,
} = require("../contoller/studentController/scheduleController");
const {
  validtaeSignup,
  validtaeAddLecture,
  validtaeLogin,
  validtaeEditLecture,
  validtaeForgetPassword,
  validtaeResetPassword,
  validtaeVerifyUpdatePassword,
} = require("../validation/validator");
const { getMenu } = require("../contoller/restaurant/restaurantController");
const { studentPermission } = require("../permission");
const {
  createOrder,
  getOrders,
} = require("../contoller/studentController/studnetOrder");
const router = express.Router();
router.post("/login", validtaeLogin, login);
router.post("/signup", validtaeSignup, signup);
router.post("/verify", verify, createSchedule);
router.post("/forgetPassword", validtaeForgetPassword, forrgetPassword);
router.post(
  "/verifyUpdatePassword",
  validtaeVerifyUpdatePassword,
  verifyUpdatePassword
);
router.post("/restPassword", validtaeResetPassword, restPassword);
//router.use(protect);
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
  deleteLecture
);
router.patch(
  "/editLecture/:lectureId/:userId",
  protect,
  studentPermission,
  validtaeEditLecture,
  editLecture
);
router.get("/getLectures/:userId", protect, studentPermission, getLectures);
router.get(
  "/getMenu/:restaurantId/:userId",
  protect,
  studentPermission,
  getMenu
);
router.post("/createOrder/:userId", protect, studentPermission, createOrder);
router.get("/orders/:userId", protect, studentPermission, getOrders);
module.exports = router;
