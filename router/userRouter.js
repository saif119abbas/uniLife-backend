const express = require("express");
const {
  login,
  protect,
} = require("../contoller/userController/authController");
const {
  forrgetPassword,
  verifyUpdatePassword,
  restPassword,
} = require("../contoller/userController/forgetPassword");

const {
  validtaeLogin,
  validtaeForgetPassword,
  validtaeResetPassword,
  validtaeVerifyUpdatePassword,
} = require("../validation/validator");

const router = express.Router();
router.post("/login", validtaeLogin, login);
router.post("/forgetPassword", validtaeForgetPassword, forrgetPassword);
router.post(
  "/verifyUpdatePassword",
  validtaeVerifyUpdatePassword,
  verifyUpdatePassword
);
router.post("/restPassword", protect, validtaeResetPassword, restPassword);
//router.use(protect);
module.exports = router;
