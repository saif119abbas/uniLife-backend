const AppError = require("../../utils/appError");
const { user } = require("../../models");
const catchAsync = require("../../utils/catchAsync");
exports.getResturants = catchAsync(async (_, res) => {
  const data = await user.findAll({
    attributes: ["id", "username", "email", "phoneNum"],
    where: { role: process.env.RESTAURANT },
  });
  res.status(200).json({
    status: "success",
    data,
  });
});
