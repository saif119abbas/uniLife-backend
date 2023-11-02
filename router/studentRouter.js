const express = require("express");
const {
  login,
  signup,
  forrgetPassword,
  verify,
  verifyUpdatePassword,
  restPassword,
  protect,
} = require("../contoller/authController");
const {
  createSchedule,
  addLecture,
  deleteLecture,
  editLecture,
} = require("../contoller/studentController/scheduleController");
const {
  validtaeSignup,
  validtaeAddLecture,
} = require("../validation/validator");
const router = express.Router();
router.post("/login", login);
router.post("/signup", validtaeSignup, signup);
router.post("/verify", protect, verify);
router.post("/forgetPassword", forrgetPassword);
router.post("/verifyUpdatePassword", verifyUpdatePassword);
router.post("/restPassword", restPassword);
//router.use(protect);
router.post("/addLecture", protect, validtaeAddLecture, addLecture);
router.delete("/deleteLecture/:id", protect, deleteLecture);
router.patch("/editLecture/:id", protect, editLecture);
module.exports = router;
