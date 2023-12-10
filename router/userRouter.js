const express = require("express");
const router = express.Router();
const {
  login,
  protect,
  storeData,
  retriveData,
  downloadFile,
} = require("../contoller/userController/authController");
const { getMenu } = require("../contoller/restaurant/restaurantController");
const {
  forrgetPassword,
  verifyUpdatePassword,
  restPassword,
} = require("../contoller/userController/forgetPassword");
const { uploadProcessData } = require("../firebaseConfig");
const {
  validtaeLogin,
  validtaeForgetPassword,
  validtaeResetPassword,
  validtaeVerifyUpdatePassword,
} = require("../validation/validator");
const {
  getResturants,
  getResturant,
  getCatigory,
  getMajor,
} = require("../contoller/userController/generalController");
const {
  adminOrStuPermission,
  RestauarntOrStuPermission,
} = require("../permission");
router.post("/login", validtaeLogin, login);
router.post("/forgetPassword", validtaeForgetPassword, forrgetPassword);
router.post(
  "/verifyUpdatePassword",
  validtaeVerifyUpdatePassword,
  verifyUpdatePassword
);
router.post("/restPassword", protect, validtaeResetPassword, restPassword);
router.post("/restPassword", protect, validtaeResetPassword, restPassword);
router.get(
  "/restaurants/:userId",
  protect,
  adminOrStuPermission,
  getResturants
);
router.get(
  "/restaurants/:userId/:resturantId",
  protect,
  adminOrStuPermission,
  getResturant
); //may be not neccessary
router.get(
  "/menu/:restaurantId/:userId",
  protect,
  RestauarntOrStuPermission,
  getMenu
);
router.get("/catigory/:userId", protect, adminOrStuPermission, getCatigory);
router.get("/major/:userId", protect, adminOrStuPermission, getMajor);
router.get("/firebase", storeData);
router.get("/firebaseget", retriveData);
router.get("/downloadFile", downloadFile);
//router.use(protect);
module.exports = router;
