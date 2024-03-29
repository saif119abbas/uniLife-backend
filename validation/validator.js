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
  console.log("from validator:", req.body.data);
  const student = req.body;
  const { error, _ } = signupValidation.validate(student);
  if (error) {
    console.log("error validator:", error);
    return res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
  next();
};
exports.validtaeLogin = (req, res, next) => {
  const student = req.body;
  console.log("student", student);
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
  console.log("validtaeAddRestaurant", req.body.data);
  const data = JSON.parse(req.body.data);
  const { error, _ } = addResturantValidation.validate(data);
  if (error) {
    console.log("The err", error);
    return res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
  next();
};
exports.validtaeEditRestaurant = (req, res, next) => {
  console.log("validtaeEditRestaurant:", req.body.data);
  const data = JSON.parse(req.body.data);
  const { error, _ } = editRestaurantValidation.validate(data);
  if (error) {
    return res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
  next();
};
exports.validtaeAddDormitoryOwner = (req, res, next) => {
  console.log("validate=", req.body.data);
  const data = JSON.parse(req.body.data);
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
  const data = JSON.parse(req.body.data);
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
  console.log(req.body.data);
  const data = JSON.parse(req.body.data);
  const { services, lon, lat, distance, numberOfRoom, gender, name } = data;
  const { error, _ } = addPostValidtaion.validate({
    services,
    lon,
    lat,
    distance,
    numberOfRoom,
    gender,
    name,
  });
  if (error) {
    return res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
  next();
};
exports.validtaeAddRooms = (req, res, next) => {
  const data = JSON.parse(req.body.data);
  const { rooms } = data;
  const { error, _ } = createRoomValidation.validate(rooms);
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
  const data = req.body.data;
  const { error, _ } = sendMessageValidation.validate(data);
  if (error) {
    return res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
  next();
};
