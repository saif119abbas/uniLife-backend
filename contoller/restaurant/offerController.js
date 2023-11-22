const AppError = require("../../utils/appError");
const { restaurant, menu, foodItem } = require("../../models");
const catchAsync = require("../../utils/catchAsync");
exports.addOffer = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  const foodId = req.params.foodId;
  const myFoodItem = req.body;
  console.log("The UserId: ", userId, "The foodId: ", foodId);
  const myRestaurant = await restaurant.findOne({
    where: { userId },
  });
  if (!myRestaurant)
    return res.status(404).json({
      status: "failed",
      message: "not found",
    });
  const restaurantId = myRestaurant.id;
  const myMenu = await menu.findOne({ where: { restaurantId } });
  if (!myMenu)
    return res.status(404).json({
      status: "failed",
      message: "not found",
    });
  const menuId = myMenu.menuId;
  console.log("menuId: ", menuId);

  myFoodItem.isOffer = true;
  foodItem
    .update(myFoodItem, { where: { foodId, menuMenuId: menuId } })
    .then((count) => {
      if (count[0] > 1)
        return res.status(403).json({
          status: "failed",
          message: "not allowed",
        });
      else if (count[0] === 0)
        return res.status(404).json({
          status: "failed",
          message: "not found",
        });
      if (count[0] === 1)
        return res.status(200).json({
          status: "success",
          message: "updated successfully",
        });
    })
    .catch((err) => {
      console.log(err);
      if (err)
        return next(new AppError("An error occurred please try again", 500));
    });
});
exports.cancelOffer = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  const foodId = req.params.foodId;
  console.log("The UserId: ", userId, "The foodId: ", foodId);
  const myRestaurant = await restaurant.findOne({
    where: { userId },
  });
  if (!myRestaurant)
    return res.status(404).json({
      status: "failed",
      message: "not found",
    });
  const restaurantId = myRestaurant.id;
  const myMenu = await menu.findOne({ where: { restaurantId } });
  if (!myMenu)
    return res.status(404).json({
      status: "failed",
      message: "not found",
    });
  const menuId = myMenu.menuId;
  console.log("menuId: ", menuId);
  const myFoodItem = {
    isOffer: false,
    offerPrice: 0,
    offerDesc: "no offer",
  };
  foodItem
    .update(myFoodItem, { where: { foodId, menuMenuId: menuId } })
    .then((count) => {
      if (count[0] > 1)
        return res.status(403).json({
          status: "failed",
          message: "not allowed",
        });
      else if (count[0] === 0)
        return res.status(404).json({
          status: "failed",
          message: "not found",
        });
      if (count[0] === 1)
        return res.status(200).json({
          status: "failed",
          message: "updated successfully",
        });
    })
    .catch((err) => {
      console.log(err);
      if (err)
        return next(new AppError("An error occurred please try again", 500));
    });
});
