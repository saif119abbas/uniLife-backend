const express = require("express");
const router = express.Router();
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
const {
  getResturants,
} = require("../contoller/userController/generalController");
const { required } = require("joi");
const { adminOrStuPermission } = require("../permission");
router.post("/login", validtaeLogin, login);
router.post("/forgetPassword", validtaeForgetPassword, forrgetPassword);
router.post(
  "/verifyUpdatePassword",
  validtaeVerifyUpdatePassword,
  verifyUpdatePassword
);
router.post("/restPassword", protect, validtaeResetPassword, restPassword);
router.post("/restPassword", protect, validtaeResetPassword, restPassword);
router.get("/resturants/:userId", protect, adminOrStuPermission, getResturants);
//router.use(protect);
module.exports = router;
