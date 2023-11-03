const { signupValidation, loginValidation } = require("./authValidation");
const AppError = require("../utils/appError");
const {
  addLectureValidation,
  editLectureValidation,
} = require("./lectureValidation");
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
