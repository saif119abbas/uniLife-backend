const AppError = require("../../utils/appError");
const { restaurant, menu, foodItem } = require("../../models");
const catchAsync = require("../../utils/catchAsync");
exports.addFoodItem = catchAsync(async (req, res, next) => {
  const myRestaurant = await restaurant.findOne({
    where: { userId: req.session.userId },
  });
  if (!myRestaurant)
    return res.status(404).json({ status: "failed", message: "not found" });
  const restaurantId = myRestaurant.id;
  const myMenu = await menu.findOne({ where: { restaurantId } });
  if (!myMenu)
    return res.status(404).json({ status: "failed", message: "not found" });
  const menuId = myMenu.menuId;
  console.log("menuId: ", restaurantId);
  req.session.menuId = menuId;
  const myFoodItem = JSON.parse(req.body.data);
  const myImage = req.file;
  console.log("The image: ", myImage);
  console.log("The food", req.body);
  myFoodItem.menuMenuId = menuId;
  myFoodItem.image = myImage;
  await foodItem
    .create(myFoodItem)
    .then((data) => {
      return res
        .status(201)
        .json({ status: "success", message: "created successfully" });
    })
    .catch((err) => {
      console.log(err);
      if (err.name === "SequelizeUniqueConstraintError")
        return res.status(401).json({
          status: "failed",
          message: "this food is already exists",
        });
      return next(new AppError("An error occured please try again", 500));
    });
});
exports.getMenu = catchAsync(async (req, res, next) => {
  const restaurantId = req.params.restaurantId;
  const myMenu = await menu.findOne({
    where: { restaurantId },
  });
  if (!myMenu)
    return res.status(404).json({
      status: "failed",
      message: "not found",
    });
  const data = await foodItem.findAll({
    attributes: ["foodId", "description", "price", "nameOfFood", "image"],
    where: { menuMenuId: myMenu.menuId },
  });
  if (!data)
    return res.status(404).json({
      status: "failed",
      message: "there no menu",
    });
  res.status(200).json({
    status: "success",
    data,
  });
});
exports.editFoodItem = catchAsync(async (req, res, next) => {
  const myFoodItem = JSON.parse(req.body.data);
  const myImage = req.file;
  const myRestaurant = await restaurant.findOne({
    where: { userId: req.session.userId },
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
  if (myImage) myFoodItem.image = myImage;
  const foodId = req.params.foodId;
  const menuId = myMenu.menuId;
  console.log("menuId: ", menuId);
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

exports.deleteFoodItem = catchAsync(async (req, res, next) => {
  const foodId = req.params.foodId;
  const myRestaurant = await restaurant.findOne({
    where: { userId: req.session.userId },
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
  foodItem
    .destroy({ where: { foodId, menuMenuId: menuId } })
    .then((deleteCount) => {
      if (deleteCount > 1)
        return res.status(403).json({
          status: "failed",
          message: "not allowed",
        });
      else if (deleteCount === 0)
        return res.status(404).json({
          status: "failed",
          message: "not found",
        });
      if (deleteCount === 1)
        return res.status(200).json({
          status: "failed",
          message: "deleted successfully",
        });
    })
    .catch((err) => {
      if (err)
        return next(new AppError("An error occurred please try again", 500));
    });
});
