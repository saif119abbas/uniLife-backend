const express = require("express");
const {
  login,
  signup,
  forrgetPassword,
  verify,
} = require("../contoller/authController");
const router = express.Router();
router.post("/login", login);
router.post("/signup", signup);
router.post("/forgetPassword", forrgetPassword);
router.post("/verify", verify);
module.exports = router;
