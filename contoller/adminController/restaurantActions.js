const bcrypt = require("bcrypt");
const AppError = require("../../utils/appError");
const { restaurant, menu, user, foodItem } = require("../../models");
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
      restaurantData.role = process.env.RESTAURANT;
      user
        .create(restaurantData)
        .then((data) => {
          const myData = { userId: data.id };
          restaurant
            .create(myData)
            .then((resData) => {
              req.session.restaurantId = resData.id;
              next();
            })
            .catch((err) => {
              console.log("the error occurred", err);
              if (err.name === "SequelizeUniqueConstraintError")
                res.status(409).json({
                  status: "failed",
                  message: "This account is already created",
                });

              return next(
                new AppError("An error occured please try again ", 500)
              );
            });
        })
        .catch((err) => {
          console.log("An error", err);
          if (err.name === "SequelizeUniqueConstraintError")
            res.status(409).json({
              status: "failed",
              message: "This account is already created",
            });

          return next(new AppError("An error occured please try again ", 500));
        });
    });
  }
};
exports.createMenu = catchAsync(async (req, res, next) => {
  const menuData = {
    restaurantId: req.session.restaurantId,
  };
  menu
    .create(menuData)
    .then(() => {
      return res.status(201).json({
        status: "success",
        message: "created successfully",
      });
    })
    .catch((err) => {
      console.log("My err:", err);
      return next(new AppError("An error occured please try again ", 500));
    });
});
exports.editRestaurant = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  const restaurantData = req.body;
  console.log(restaurantData);
  let hash = undefined;
  if (restaurantData.password) {
    if (restaurantData.password !== restaurantData.confirmPassword) {
      console.log("password mismatch");
      return res.status(400).json({
        status: "falied",
        message: "the password and confirm password do not match",
      });
    }
    hash = await new Promise((resolve, reject) => {
      bcrypt.hash(restaurantData.password, 12, (err, hash) => {
        if (err) {
          reject(new AppError("an error occurred please try again", 500));
        } else {
          resolve(hash);
        }
      });
    });
  }
  restaurantData.password = hash;
  console.log("hash password", hash);
  await user
    .update(restaurantData, {
      where: { id: userId, role: process.env.RESTAURANT },
    })
    .then((count) => {
      console.log(count);
      console.log("LLL");
      if (count[0] === 1) {
        return res.status(200).json({
          status: "success",
          message: "updated successfuly",
        });
      } else if (count[0] === 0) {
        return res.status(404).json({
          status: "failed",
          message: "not found",
        });
      }
    })
    .catch((err) => {
      if (err.name === "SequelizeUniqueConstraintError")
        res.status(409).json({
          status: "failed",
          message: "This account is already created",
        });
      console.log("my error", err);
      if (err)
        return next(new AppError("1an error occurred please try again", 500));
    });
});
exports.deleteRestaurant = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  await restaurant
    .destroy({ where: { userId } })
    .then((deleteCount) => {
      if (deleteCount > 1)
        return next(new AppError("Somethig went wrong please try again", 500));
      else if (deleteCount === 1) {
        user
          .destroy({ where: { id: userId, role: process.env.RESTAURANT } })
          .then((deleteCount) => {
            if (deleteCount > 1)
              return next(
                new AppError("Somethig went wrong please try again", 500)
              );
            else if (deleteCount === 1) return res.status(204).json({});
            else if (deleteCount === 0)
              res.status(404).json({
                status: "failed",
                message: "This restaurant was not found2",
              });
          })
          .catch((err) => {
            if (err)
              return next(
                new AppError("An error occured please try again"),
                500
              );
          });
      } else if (deleteCount === 0)
        res.status(404).json({
          status: "failed",
          message: "This restaurant was not found2",
        });
    })
    .catch((err) => {
      if (err)
        return next(new AppError("An error occured please try again"), 500);
    });
});
exports.deleteMenu = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  const myRestaurant = await restaurant.findOne({ where: { userId } });
  if (!myRestaurant)
    return res.status(404).json({ status: "failed", message: "not found" });
  const restaurantId = myRestaurant.id;
  menu
    .destroy({ where: { restaurantId } })
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
/*exports.editCardID = catchAsync(async (req, res, next) => {
  const cardID = req.body.cardID;
  console.log("editCardID");
  if (!cardID) next();
  const userId = req.params.userId;
  restaurant
    .update({ cardID }, { where: { userId } })
    .then((count) => {
      if (count[0] === 1) return next();
      return res.status(404).json({
        status: "failed",
        message: "This restaurant was not found",
      });
    })
    .catch((err) => {
      if (err.name === "SequelizeUniqueConstraintError")
        return res.status(401).json({
          status: "failed",
          message: "you are not allowed to use this cardID",
        });
      return next(new AppError("An error occured please try again"), 500);
    });
});*/
