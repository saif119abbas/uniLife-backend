const AppError = require("./utils/appError");
const catchAsync = require("./utils/catchAsync");
exports.studentPermission = catchAsync(async (_, res, next) => {
  try {
    const role = res.locals.role;
    console.log("My role is ", res.locals.role);
    if (role !== process.env.STUDENT)
      return res.status(403).json({
        status: "failed",
        message: "not allowed",
      });
    else return next();
  } catch (err) {
    console.log("The err", err);
  }
});
exports.adminPermission = catchAsync(async (_, res, next) => {
  // console.log("My role is ", res.locals.role);
  const role = res.locals.role;
  console.log("My role is ", role);
  if (role !== process.env.ADMIN)
    return res.status(403).json({
      status: "failed",
      message: "not allowed2",
    });
  else return next();
});
exports.restaurantPermission = catchAsync(async (_, res, next) => {
  const role = res.locals.role;
  console.log("My role is ", res.locals.role);
  if (role !== process.env.RESTAURANT)
    return res.status(403).json({
      status: "failed",
      message: "not allowed",
    });
  else return next();
});
exports.dormitoryPermission = catchAsync(async (_, res, next) => {
  const role = res.locals.role;
  console.log("My role is ", res.locals.role);
  if (role !== process.env.DORMITORY)
    return res.status(403).json({
      status: "failed",
      message: "not allowed",
    });
  else return next();
});
exports.adminOrStuPermission = catchAsync(async (_, res, next) => {
  const role = res.locals.role;
  console.log("My role is ", res.locals.role);
  if (role !== process.env.STUDENT && role !== process.env.ADMIN)
    return res.status(403).json({
      status: "failed",
      message: "not allowed",
    });
  else return next();
});
exports.RestauarntOrStuPermission = catchAsync(async (_, res, next) => {
  console.log("My role is ", res.locals.role);
  const role = res.locals.role;
  if (role !== process.env.STUDENT && role !== process.env.RESTAURANT)
    return res.status(403).json({
      status: "failed",
      message: "not allowed",
    });
  else return next();
});
