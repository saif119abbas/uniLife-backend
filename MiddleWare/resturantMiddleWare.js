const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { order, user, restaurant } = require("../models");
exports.restaurantCheckOrder = catchAsync(async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const orderId = req.params.orderId;
    const myOrder = await order.findOne({
      attributes: ["restaurantId", "status"],
      where: { orderId },
    });
    console.log("My order", myOrder);
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
    else {
      res.locals.restaurantId = myOrder.restaurantId;
      res.locals.status = myOrder.status;
      console.log("from middleware:", myOrder.status, myOrder.restaurantId);
      console.log(
        "from middleware:",
        res.locals.restaurantId,
        res.locals.status
      );
      return next();
    }
  } catch (err) {
    console.log("######", err);
  }
});
