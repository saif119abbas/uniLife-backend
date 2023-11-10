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
const { studentPermission } = require("../permission");
const router = express.Router();
router.post("/login", validtaeLogin, login);
router.post("/signup", validtaeSignup, signup);
router.post("/verify", verify);
router.post("/forgetPassword", validtaeForgetPassword, forrgetPassword);
router.post(
  "/verifyUpdatePassword",
  validtaeVerifyUpdatePassword,
  verifyUpdatePassword
);
router.post("/restPassword", validtaeResetPassword, restPassword);
//router.use(protect);
router.post(
  "/addLecture",
  protect,
  studentPermission,
  validtaeAddLecture,
  addLecture
);
router.delete("/deleteLecture/:id", protect, studentPermission, deleteLecture);
router.patch(
  "/editLecture/:id",
  protect,
  studentPermission,
  validtaeEditLecture,
  editLecture
);
module.exports = router;
