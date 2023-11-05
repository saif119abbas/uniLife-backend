const bcrypt = require("bcrypt");
const AppError = require("../../utils/appError");
const { restaurant, menu } = require("../../models");
const catchAsync = require("../../utils/catchAsync");
exports.addRestaurant = (req, res, next) => {
  const restaurantData = req.body;
  if (restaurantData.password !== restaurantData.confirmPassword)
    res.status(400).json({
      status: "falied",
      message: "password and confirm password not matched",
    });
  else {
    restaurantData.confirmPassword = undefined;
    bcrypt.hash(restaurantData.password, 12, (err, hash) => {
      if (err)
        return next(new AppError("an error occurred please try again", 500));
      restaurantData.password = hash;
      restaurant
        .create(restaurantData)
        .then((data) => {
          const menuData = {
            restaurantRestaurantId: data.restaurantId,
          };
          menu
            .create(menuData)
            .then(() => {
              res.status(201).json({
                status: "success",
                message: "created successfully",
              });
            })
            .catch(() => {
              return next(
                new AppError("An error occured please try again ", 500)
              );
            });
        })
        .catch((err) => {
          if (err.name === "SequelizeUniqueConstraintError")
            res.status(401).json({
              status: "failed",
              message: "This account is already created",
            });

          return next(new AppError("An error occured please try again ", 500));
        });
    });
  }
};
exports.editRestaurant = catchAsync(async (req, res, next) => {
  const restaurantId = req.params.id;
  const restaurantData = req.body;
  console.log(restaurantData);
  if (restaurantData.password === undefined) {
    const count = await restaurant.update(restaurantData, {
      where: { restaurantId },
    });
    if (count === 1)
      res.status(200).json({
        status: "success",
        message: "updated successfully",
      });
    else
      res.status(404).json({
        status: "faield",
        message: "This restaurant  was not found",
      });
  } else {
    bcrypt.hash(restaurantData.password, 12, (err, hash) => {
      if (err)
        return next(new AppError("an error occurred please try again", 500));
      if (restaurantData.password !== restaurantData.confirmPassword) {
        console.log("password mismatch");
        res.status(400).json({
          status: "falied",
          message: "the password and confirm password do not match",
        });
      } else {
        restaurantData.password = hash;
        restaurant.update(restaurantData, {
          where: { restaurantId },
        });

        res.status(200).json({
          status: "success",
          message: "updated successfully",
        });
      }
    });
  }
});
exports.deleteRestaurant = catchAsync(async (req, res, next) => {
  const restaurantId = req.params.id;
  restaurant
    .destroy({ where: { restaurantId } })
    .then((deleteCount) => {
      if (deleteCount > 1)
        return next(new AppError("Somethig went wrong please try again", 500));
      else if (deleteCount === 1)
        res.status(204).json({
          status: "success",
          message: "The restaurant was deleted successfully",
        });
      else if (deleteCount === 0)
        res.status(404).json({
          status: "failed",
          message: "This restaurant was not found2",
        });
    })
    .catch(() => {
      return next(new AppError("An error occured please try again"), 500);
    });
});
exports.deleteMenu = catchAsync(async (req, res, next) => {
  const restaurantId = req.params.id;
  menu
    .destroy({ where: { restaurantRestaurantId: restaurantId } })
    .then((deleteCount) => {
      if (deleteCount > 1)
        return next(new AppError("Somethig went wrong please try again", 500));
      else if (deleteCount == 1) next();
      else if (deleteCount == 0)
        res.status(404).json({
          status: "failed",
          message: "This restaurant was not found",
        });
    })
    .catch(() => {
      return next(new AppError("An error occured please try again"), 500);
    });
});
