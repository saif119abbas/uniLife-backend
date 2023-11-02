const { studentValidator, lectureValidator } = require("./validation");
const AppError = require("../utils/appError");
exports.validtaeSignup = (req, res, next) => {
  const student = req.body;
  const { error, val } = studentValidator.validate(student);
  console.log("Validation ");
  if (error) {
    return next(new AppError(error.message, 400));
  }
  next();
};
exports.validtaeAddLecture = (req, res, next) => {
  const lecture = req.body;
  const { error, val } = lectureValidator.validate(lecture);
  if (error) {
    return next(new AppError(error.message, 400));
  }
  next();
};
