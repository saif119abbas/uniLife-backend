const AppError = require("./utils/appError");
const catchAsync = require("./utils/catchAsync");
const { user } = require("./models");
exports.studentPermission = catchAsync(async (req, _, next) => {
  const userId = req.params.userId;
  const myRole = await user.findOne({
    attributes: ["role"],
    where: { id: userId },
  });
  if (myRole.role !== process.env.STUDENT)
    return next(new AppError("not allowed", 403));
  next();
});
exports.adminPermission = catchAsync(async (req, _, next) => {
  const userId = req.params.userId;
  const myRole = await user.findOne({
    attributes: ["role"],
    where: { id: userId },
  });
  if (myRole.role !== process.env.ADMIN)
    return next(new AppError("not allowed", 403));
  next();
});
exports.restaurantPermission = catchAsync(async (req, _, next) => {
  const userId = req.params.userId;
  const myRole = await user.findOne({
    attributes: ["role"],
    where: { id: userId },
  });
  if (myRole.rolee !== process.env.RESTAURANT)
    return next(new AppError("not allowed", 403));
  next();
});
