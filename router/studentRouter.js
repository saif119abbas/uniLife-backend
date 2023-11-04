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
} = require("../validation/validator");
const router = express.Router();
router.post("/login", validtaeLogin, login);
router.post("/signup", validtaeSignup, signup);
router.post("/verify", verify);
router.post("/forgetPassword", validtaeForgetPassword, forrgetPassword);
router.post("/verifyUpdatePassword", verifyUpdatePassword);
router.post("/restPassword", validtaeResetPassword, restPassword);
//router.use(protect);
router.post("/addLecture", protect, validtaeAddLecture, addLecture);
router.delete("/deleteLecture/:id", protect, deleteLecture);
router.patch("/editLecture/:id", protect, validtaeEditLecture, editLecture);
module.exports = router;
