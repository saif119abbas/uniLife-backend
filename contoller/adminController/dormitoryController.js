const bcrypt = require("bcrypt");
const AppError = require("../../utils/appError");
const { dormitoryOwner } = require("../../models");
const catchAsync = require("../../utils/catchAsync");
exports.addDormitoryOwner = (req, res, next) => {
  const dormitoryOwnerData = req.body;
  console.log(dormitoryOwnerData);
  if (dormitoryOwnerData.password !== dormitoryOwnerData.confirmPassword) {
    res.status(400).json({
      status: "failed",
      message: "password and confirm password don't matched",
    });
  } else {
    dormitoryOwnerData.confirmPassword = undefined;
    bcrypt.hash(dormitoryOwnerData.password, 12, (err, hash) => {
      if (err)
        return next(new AppError("an error occurred please try again", 500));
      dormitoryOwnerData.password = hash;
      dormitoryOwner
        .create(dormitoryOwnerData)
        .then((data) => {
          res.status(201).json({
            status: "success",
            message: "created successfully",
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
  } // password === comfirmPassword
};
exports.editDormitoryOwner = catchAsync(async (req, res, next) => {
  const SSN = req.params.SSN;
  const dormitoryOwnerData = req.body;
  console.log(dormitoryOwnerData);
  if (dormitoryOwnerData.password === undefined) {
    const count = await dormitoryOwner.update(dormitoryOwnerData, {
      where: { SSN },
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
  }
  bcrypt.hash(dormitoryOwnerData.password, 12, (err, hash) => {
    if (err)
      return next(new AppError("an error occurred please try again", 500));
    if (dormitoryOwnerData.password !== dormitoryOwnerData.confirmPassword) {
      console.log("password mismatch");
      res.status(400).json({
        status: "falied",
        message: "the password and confirm password do not match",
      });
    } else {
      dormitoryOwnerData.password = hash;
      dormitoryOwner.update(dormitoryOwnerData, {
        where: { SSN },
      });

      res.status(200).json({
        status: "success",
        message: "updated successfully",
      });
    }
  });
});
exports.deleteDormitoryOwner = catchAsync(async (req, res, next) => {
  const SSN = req.params.SSN;
  dormitoryOwner
    .destroy({ where: { SSN } })
    .then((deleteCount) => {
      if (deleteCount > 1)
        return next(new AppError("Somethig went wrong please try again", 500));
      else if (deleteCount === 1)
        res.status(204).json({
          status: "success",
          message: "deleted successfully",
        });
      else if (deleteCount === 0)
        res.status(404).json({
          status: "failed",
          message: "This restaurant was not found",
        });
    })
    .catch(() => {
      return next(new AppError("An error occured please try again"), 500);
    });
});
/*exports.deleteMenu = catchAsync(async (req, res, next) => {
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
});*/
