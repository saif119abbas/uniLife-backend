const AppError = require("./utils/appError");
const catchAsync = require("./utils/catchAsync");
const { user } = require("./models");
const myRole = catchAsync(async (req) => {
  const id = req.params.userId;
  const myRole = await user.findOne({
    attributes: ["role"],
    where: { id },
  });
  console.log(myRole.role);
  return myRole.role;
});
exports.studentPermission = catchAsync(async (req, res, next) => {
  const id = req.params.userId;
  const myRole = await user.findOne({
    attributes: ["role"],
    where: { id },
  });
  if (myRole.role !== process.env.STUDENT || !myRole)
    return res.status(403).json({
      status: "failed",
      message: "not allowed",
    });
  return next();
});
exports.adminPermission = catchAsync(async (req, res, next) => {
  const id = req.params.adminId;
  const myRole = await user.findOne({
    attributes: ["role"],
    where: { id },
  });
  if (myRole.role !== process.env.ADMIN || !myRole)
    return res.status(403).json({
      status: "failed",
      message: "not allowed",
    });
  return next();
});
exports.restaurantPermission = catchAsync(async (req, res, next) => {
  const id = req.params.userId;
  const myRole = await user.findOne({
    attributes: ["role"],
    where: { id },
  });
  if (myRole.role !== process.env.RESTAURANT || !myRole)
    return res.status(403).json({
      status: "failed",
      message: "not allowed",
    });
  return next();
});
exports.dormitoryPermission = catchAsync(async (req, res, next) => {
  const id = req.params.userId;
  const myRole = await user.findOne({
    attributes: ["role"],
    where: { id },
  });
  if (myRole.role !== process.env.DORMITORY || !myRole)
    return res.status(403).json({
      status: "failed",
      message: "not allowed",
    });
  return next();
});
exports.adminOrStuPermission = catchAsync(async (req, res, next) => {
  const id = req.params.userId;
  const myRole = await user.findOne({
    attributes: ["role"],
    where: { id },
  });
  if (
    (myRole.role !== process.env.ADMIN &&
      myRole.role !== process.env.STUDENT) ||
    !myRole
  )
    return res.status(403).json({
      status: "failed",
      message: "not allowed",
    });
  return next();
});
