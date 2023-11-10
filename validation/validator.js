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
exports.validtaeSignup = (req, res, next) => {
  const student = req.body;
  const { error, val } = signupValidation.validate(student);
  if (error) {
    return next(new AppError(error.message, 400));
  }
  next();
};
exports.validtaeLogin = (req, res, next) => {
  const student = req.body;
  const { error, val } = loginValidation.validate(student);
  if (error) {
    return next(new AppError(error.message, 400));
  }
  next();
};
exports.validtaeAddLecture = (req, res, next) => {
  const lecture = req.body;
  const { error, val } = addLectureValidation.validate(lecture);
  if (error) {
    return next(new AppError(error.message, 400));
  }
  next();
};
exports.validtaeEditLecture = (req, res, next) => {
  const lecture = req.body;
  const { error, val } = editLectureValidation.validate(lecture);
  if (error) {
    return next(new AppError(error.message, 400));
  }
  next();
};
exports.validtaeForgetPassword = (req, res, next) => {
  const data = req.body;
  const { error, val } = forgetPasswordValidation.validate(data);
  if (error) {
    console.log("message ", error.message);
    return next(new AppError(error.message, 400));
  }
  next();
};
exports.validtaeVerifyUpdatePassword = (req, res, next) => {
  const data = req.body;
  const { error, val } = verifyUpdatePasswordValidation.validate(data);
  if (error) {
    return next(new AppError(error.message, 400));
  }
  next();
};
exports.validtaeResetPassword = (req, res, next) => {
  const data = req.body;
  const { error, val } = resetPasswordValidation.validate(data);
  if (error) {
    return next(new AppError(error.message, 400));
  }
  next();
};
exports.validtaeAddRestaurant = (req, res, next) => {
  const data = req.body;
  const { error, val } = addResturantValidation.validate(data);
  if (error) {
    return next(new AppError(error.message, 400));
  }
  next();
};
exports.validtaeEditRestaurant = (req, res, next) => {
  const data = req.body;
  const { error, val } = editRestaurantValidation.validate(data);
  if (error) {
    return next(new AppError(error.message, 400));
  }
  next();
};
exports.validtaeAddDormitoryOwner = (req, res, next) => {
  const data = req.body;
  const { error, val } = addDormitoryOwnerValidation.validate(data);
  if (error) {
    return next(new AppError(error.message, 400));
  }
  next();
};
exports.validtaeEditDormitoryOwner = (req, res, next) => {
  const data = req.body;
  const { error, val } = editDormitoryOwnerValidation.validate(data);
  if (error) {
    return next(new AppError(error.message, 400));
  }
  next();
};
