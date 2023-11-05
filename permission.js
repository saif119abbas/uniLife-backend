const student = require("./models/student");
const AppError = require("./utils/appError");

exports.studentPermission = (req, _, next) => {
  if (req.session.permission !== process.env.STUDENT)
    return next(new AppError("not allowed", 403));
  next();
};
