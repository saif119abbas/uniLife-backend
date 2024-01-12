const bcrypt = require("bcrypt");
const { UploadFile, getURL } = require("../../firebaseConfig");

const AppError = require("../../utils/appError");
const { restaurant, menu, user, foodItem } = require("../../models");
const catchAsync = require("../../utils/catchAsync");
exports.addRestaurant = catchAsync(async (req, res, next) => {
  const restaurantData = JSON.parse(req.body.data);
  console.log("The restaurant:", restaurantData);
  const file = req.file;
  console.log("file:", file);
  if (restaurantData.password !== restaurantData.confirmPassword)
    return res.status(400).json({
      status: "falied",
      message: "password and confirm password not matched",
    });
  restaurantData.confirmPassword = undefined;
  try {
    const hash = await new Promise((resolve, reject) => {
      bcrypt.hash(restaurantData.password, 12, (err, hash) => {
        if (err) reject(err);
        else resolve(hash);
      });
    });
    restaurantData.password = hash;
    restaurantData.role = process.env.RESTAURANT;
    const userId = await new Promise((resolve, reject) => {
      user.create(restaurantData).then((record) => {
        if (record) resolve(record.id);
      });
    }).catch((err) => {
      reject(err);
    });
    const restaurantId = await new Promise((resolve) => {
      restaurant
        .create({ userId })
        .then((record) => {
          if (record) {
            res.locals.restaurantId = record.id;
            resolve(record.id);
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
    const nameImage = `/restaurant/${restaurantId}`;
    console.log(file);
    await UploadFile(file.buffer, nameImage);
    const image = await getURL(nameImage);
    console.log(image);
    restaurant
      .update({ image }, { where: { id: restaurantId } })
      .then((count) => {
        if (count[0] === 1) next();
      })
      .catch((err) => {
        reject(err);
      });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError")
      return res.status(409).json({
        status: "failed",
        message: "This account is already created",
      });
    console.log(err);
    return next(new AppError("an error occurred please try again", 500));
  }
});
exports.createMenu = catchAsync(async (req, res, next) => {
  const menuData = {
    restaurantId: res.locals.restaurantId,
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
  const restaurantId = req.params.restaurantId;
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
  const id = await new Promise((resolve, reject) => {
    restaurant
      .findOne({ attributes: ["userId"], where: { id: restaurantId } })
      .then((record) => {
        if (record) resolve(record.userId);
        else
          return res
            .status(404)
            .json({ status: "failed", message: "not found restaurant" });
      });
  });
  // console.log("userId", userId);
  await user
    .update(restaurantData, {
      where: { id, role: process.env.RESTAURANT },
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
  const restaurantId = req.params.restaurantId;
  const userId = await new Promise((resolve, reject) => {
    restaurant
      .findOne({ attributes: ["userId"], where: { id: restaurantId } })
      .then((record) => {
        if (record) resolve(record.userId);
        else
          return res.status(404).json({
            status: "failed",
            message: "not found1",
          });
      });
  });
  console.log("delete restaurant", userId);
  await restaurant
    .destroy({ where: { id: restaurantId } })
    .then((deleteCount) => {
      if (deleteCount > 1)
        return next(new AppError("Somethig went wrong please try again", 500));
      else if (deleteCount === 1) {
        user
          .destroy({ where: { id: userId, role: process.env.RESTAURANT } })
          .then((count2) => {
            console.log("deleteCount=", count2);
            if (count2 > 1)
              return next(
                new AppError("Somethig went wrong please try again", 500)
              );
            else if (count2 === 1) return res.status(204).json({});
            else if (count2 === 0)
              res.status(404).json({
                status: "failed",
                message: "not found1",
              });
          })
          .catch((err) => {
            console.log("my error: ", err);
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
  const restaurantId = req.params.restaurantId;

  menu
    .destroy({ where: { restaurantId } })
    .then((deleteCount) => {
      if (deleteCount > 1)
        return next(new AppError("Somethig went wrong please try again", 500));
      else if (deleteCount === 1) return next();
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
