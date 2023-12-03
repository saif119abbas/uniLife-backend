const AppError = require("../../utils/appError");
const { user } = require("../../models");
const catchAsync = require("../../utils/catchAsync");
exports.getResturants = catchAsync(async (_, res) => {
  const data = await user.findAll({
    attributes: ["id", "username", "email", "phoneNum"],
    where: { role: process.env.RESTAURANT },
  });
  if (data.length === 0)
    return res.status(404).json({
      status: "failed",
      message: "no restaurants",
    });
  return res.status(200).json({
    status: "success",
    data,
  });
});
exports.getResturant = catchAsync(async (req, res) => {
  const id = req.params.resturantId;
  const data = await user.findOne({
    attributes: ["id", "username", "email", "phoneNum"],
    where: { id, role: process.env.RESTAURANT },
  });
  if (data.length === 0)
    return res.status(404).json({
      status: "failed",
      message: "no restaurants",
    });
  return res.status(200).json({
    status: "success",
    data,
  });
});
