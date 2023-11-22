const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { order, user, restaurant } = require("../models");
exports.restaurantCheckOrder = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  const orderId = req.params.orderId;
  const myOrder = await order.findOne({
    attributes: ["restaurntId"],
    where: { orderId },
  });
  if (!myOrder) {
    return res.status(403).json({ status: "falied", message: "not allowed" });
  }
  const myResturant = await restaurant.findOne({
    attributes: ["id"],
    where: { userId },
  });

  if (!myResturant) {
    return res.status(403).json({ status: "falied", message: "not allowed" });
  }
  if (myOrder.restaurantId !== myResturant.id)
    return res.status(403).json({ status: "falied", message: "not allowed" });
  else return next();
});
