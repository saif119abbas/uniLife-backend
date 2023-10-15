const express = require("express");
const {
  login,
  signup,
  forrgetPassword,
} = require("../contoller/authController");
const router = express.Router();
router.post("/", login);
router.post("/signup", signup);
router.post("/forrgetPassword", forrgetPassword);
module.exports = router;
