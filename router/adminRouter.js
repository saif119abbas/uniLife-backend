const express = require("express");
const router = express.Router();
const {
  addRestaurant,
  editRestaurant,
  deleteRestaurant,
  deleteMenu,
} = require("../contoller/adminController/restaurantController");
const {
  addDormitoryOwner,
  editDormitoryOwner,
  deleteDormitoryOwner,
} = require("../contoller/adminController/dormitoryController");
const {
  validtaeAddRestaurant,
  validtaeEditRestaurant,
  validtaeAddDormitoryOwner,
  validtaeEditDormitoryOwner,
} = require("../validation/validator");
router.post("/addRestaurant", validtaeAddRestaurant, addRestaurant);
router.patch("/editRestaurant/:id", validtaeEditRestaurant, editRestaurant);
router.delete("/deleteRestaurant/:id", deleteMenu, deleteRestaurant);

router.post("/addDormitoryOwner", validtaeAddDormitoryOwner, addDormitoryOwner);
router.patch(
  "/editDormitoryOwner/:SSN",
  validtaeEditDormitoryOwner,
  editDormitoryOwner
);
router.delete("/deleteDormitoryOwner/:SSN", deleteDormitoryOwner);
module.exports = router;
