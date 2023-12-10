const { signupValidation, loginValidation } = require("./authValidation");
const AppError = require("../utils/appError");
const {
  addLectureValidation,
  editLectureValidation,
} = require("./lectureValidation");
const {
  forgetPasswordValidation,
  resetPasswordValidation,
  verifyUpdatePasswordValidation,
} = require("./forgetPassowrdValidation");
const {
  addResturantValidation,
  editRestaurantValidation,
} = require("./restaurantValidation");
const {
  addDormitoryOwnerValidation,
  editDormitoryOwnerValidation,
} = require("./dormitoryOwnerValidation");
const {
  addFoodItemValidation,
  editFoodItemValidation,
} = require("./foodItemValidation");
const {
  addPostValidtaion,
  editPostValidtaion,
} = require("./dormitoryPostValidation");
const { createOrderValidation } = require("./orderValidation");
const { createRoomValidation } = require("./roomValidation");
const { addOfferValidation } = require("./offerValidation");
const {
  addFacultyValidation,
  addFloorValidation,
  addClassroomValidation,
} = require("./facultyValidation");
const { sendMessageValidation } = require("./messageValidation");

exports.validtaeSignup = (req, res, next) => {
  const student = req.body;
  const { error, val } = signupValidation.validate(student);
  if (error) {
    return res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
  next();
};
exports.validtaeLogin = (req, res, next) => {
  const student = req.body;
  const { error, val } = loginValidation.validate(student);
  if (error) {
    return res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
  next();
};
exports.validtaeAddLecture = (req, res, next) => {
  const lecture = req.body;
  const { error, val } = addLectureValidation.validate(lecture);
  if (error) {
    return res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
  next();
};
exports.validtaeEditLecture = (req, res, next) => {
  const lecture = req.body;
  const { error, val } = editLectureValidation.validate(lecture);
  if (error) {
    return res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
  next();
};
exports.validtaeForgetPassword = (req, res, next) => {
  const data = req.body;
  const { error, val } = forgetPasswordValidation.validate(data);
  if (error) {
    console.log("message ", error.message);
    return res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
  next();
};
exports.validtaeVerifyUpdatePassword = (req, res, next) => {
  const data = req.body;
  const { error, val } = verifyUpdatePasswordValidation.validate(data);
  if (error) {
    return res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
  next();
};
exports.validtaeResetPassword = (req, res, next) => {
  const data = req.body;
  const { error, val } = resetPasswordValidation.validate(data);
  if (error) {
    return res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
  next();
};
exports.validtaeAddRestaurant = (req, res, next) => {
  const data = JSON.parse(req.body.data);
  console.log("validtaeAddRestaurant", data);
  const { error, _ } = addResturantValidation.validate(data);
  if (error) {
    console.log("The err", err);
    return res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
  next();
};
exports.validtaeEditRestaurant = (req, res, next) => {
  const data = req.body;
  const { error, val } = editRestaurantValidation.validate(data);
  if (error) {
    return res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
  next();
};
exports.validtaeAddDormitoryOwner = (req, res, next) => {
  const data = req.body;
  const { error, val } = addDormitoryOwnerValidation.validate(data);
  if (error) {
    return res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
  next();
};
exports.validtaeEditDormitoryOwner = (req, res, next) => {
  const data = req.body;
  const { error, val } = editDormitoryOwnerValidation.validate(data);
  if (error) {
    return res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
  next();
};
exports.validtaeAddFoodItem = (req, res, next) => {
  const data = req.body.data;
  const { error, val } = addFoodItemValidation.validate(data);
  if (error) {
    return res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
  next();
};
exports.validtaeEditFoodItem = (req, res, next) => {
  const data = req.body.data;
  const { error, _ } = editFoodItemValidation.validate(data);
  if (error) {
    return res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
  next();
};
exports.validtaeAddDormitoryPost = (req, res, next) => {
  const data = {
    description: req.body.description,
    location: req.body.location,
  };
  const { error, _ } = addPostValidtaion.validate(data);
  if (error) {
    return res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
  next();
};
exports.validtaeAddRooms = (req, res, next) => {
  const data = req.body.rooms;
  const { error, _ } = createRoomValidation.validate(data);
  if (error) {
    return res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
  next();
};
exports.validtaeEditDormitoryPost = (req, res, next) => {
  const data = req.body.data;
  const { error, _ } = editPostValidtaion.validate(data);
  if (error) {
    return res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
  next();
};
exports.validtaeCreateOrder = (req, res, next) => {
  const data = req.body.orderItem;
  const { error, _ } = createOrderValidation.validate(data);
  if (error) {
    return res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
  next();
};
exports.validtaeAddOffer = (req, res, next) => {
  const data = req.body;
  const { error, _ } = addOfferValidation.validate(data);
  if (error) {
    return res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
  next();
};
exports.validtaeAddFaculty = (req, res, next) => {
  const data = req.body;
  const { error, _ } = addFacultyValidation.validate(data);
  if (error) {
    return res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
  next();
};
exports.validtaeAddFloor = (req, res, next) => {
  const data = req.body;
  const { error, _ } = addFloorValidation.validate(data);
  if (error) {
    return res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
  next();
};
exports.validtaeAddClassroom = (req, res, next) => {
  const data = req.body;
  const { error, _ } = addClassroomValidation.validate(data);
  if (error) {
    return res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
  next();
};
exports.validtaeSendMessage = (req, res, next) => {
  const data = req.body;
  const { error, _ } = sendMessageValidation.validate(data);
  if (error) {
    return res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
  next();
};
