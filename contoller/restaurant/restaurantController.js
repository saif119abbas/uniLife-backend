const AppError = require("../../utils/appError");
const {
  restaurant,
  menu,
  foodItem,
  user,
  student,
  order,
  FCM,
} = require("../../models");
const { Sequelize, Op } = require("sequelize");
const { QueryTypes } = require("sequelize");
const databaseName = require("../../databaseName");

const { localFormatter } = require("../../utils/formatDate");
const catchAsync = require("../../utils/catchAsync");
const { UploadFile, getURL, deleteFile } = require("../../firebaseConfig");
const { pushNotification } = require("../../notification");
exports.addFoodItem = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  console.log("addFoodItem");
  const menuId = await new Promise((resolve) => {
    restaurant
      .findOne({
        attributes: [],
        where: { userId },
        include: [
          {
            model: menu,
            attributes: ["menuId"],
          },
        ],
      })
      .then((record) => {
        console.log(record);
        if (record) resolve(record.menu.menuId);
      });
  });

  if (!menuId)
    return res.status(404).json({ status: "failed", message: "not found" });
  let data = JSON.parse(req.body.data);
  let fcms = [];
  let username;
  if (data.category.toLowerCase() === "special offers") {
    fcms = await new Promise((resolve, reject) => {
      FCM.findAll({ attributes: ["token"] })
        .then((record) => {
          resolve(record);
        })
        .catch((err) => {
          reject(err);
        });
    });
    username = await new Promise((resolve, reject) => {
      user
        .findOne({ where: { id: userId }, attributes: ["username"] })
        .then((record) => {
          resolve(record.username);
        })
        .catch((err) => {
          reject(err);
        });
    });
    data = { ...data, until: new Date(data.until) };
  } else {
    data = { ...data, until: null };
  }
  const myImage = req.file;
  console.log("The image: ", myImage);
  console.log("The food", req.body);
  data = {
    ...data,
    menuMenuId: menuId,
  };
  let status = false;
  const foodId = await new Promise((resolve, reject) => {
    foodItem
      .create(data)
      .then((data) => {
        if (data) resolve(data.foodId);
        status = true;
      })
      .catch((err) => {
        console.log("The err", err);
        if (err.name === "SequelizeUniqueConstraintError")
          return res.status(409).json({
            status: "failed",
            message: "this food is already exists",
          });
        return next(new AppError("An error occured please try again", 500));
      });
  });
  if (status) {
    const nameImage = `/foodItem/${foodId}`;
    const metadata = {
      contentType: "image/jpeg",
    };
    await UploadFile(myImage.buffer, nameImage, metadata);
    const image = await getURL(nameImage);
    console.log(image);
    foodItem.update({ image }, { where: { foodId } }).then((count) => {
      if (count[0] === 1) {
        const title = "New Special Offer";
        const body = ` ${username} has a new special offer, don't miss it`;
        fcms.map((fcm) => pushNotification(fcm.token, title, body));
        return res
          .status(201)
          .json({ status: "success", message: "created successfully" });
      }
    });
  } else {
    res
      .status(500)
      .json({ status: "failed", message: "can't add food please try again" });
  }
});
exports.getMenu = catchAsync(async (req, res, next) => {
  try {
    console.log("get Menu");
    const date = new Date();
    const { restaurantId, userId } = req.params;
    let id = restaurantId;
    if (!restaurantId) id = userId;

    const menuMenuId = await new Promise((resolve, reject) => {
      restaurant
        .findOne({
          attributes: [],
          where: { userId: id },
          include: [
            {
              model: menu,
              attributes: ["menuId"],
            },
          ],
        })
        .then((record) => resolve(record.menu.menuId))
        .catch((err) => reject(err));
    });
    console.log("menu:", menuMenuId);

    console.log(foodItem);
    console.log(restaurantId);
    const data = await new Promise((resolve, reject) => {
      foodItem
        .findAll({
          attributes: [
            "foodId",
            "description",
            "price",
            "nameOfFood",
            "image",
            "category",
          ],
          where: {
            menuMenuId,
            until: { [Op.lte]: date },
          },
        })
        .then((record) => {
          console.log("data:", record);
          resolve(record);
        })
        .catch((err) => reject(err));
    });
    return res.status(200).json(data);
  } catch (err) {
    console.log("err:", err);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
});
exports.editFoodItem = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  const myFoodItem = JSON.parse(req.body.data);
  const file = req.file;
  if (file) {
    const nameImage = `/foodItems/${foodId}`;
    console.log(file);
    await UploadFile(file.buffer, nameImage);
    const image = await getURL(nameImage);
    myFoodItem.image = image;
  }
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
  const userId = req.params.userId;

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
  foodItem
    .destroy({ where: { foodId, menuMenuId: menuId } })
    .then(async (deleteCount) => {
      if (deleteCount > 1)
        return res.status(403).json({
          status: "failed",
          message: "not allowed",
        });
      else if (deleteCount === 0) {
        const nameImage = `/foodItem/${foodId}`;
        await deleteFile(nameImage);
        return res.status(404).json({
          status: "failed",
          message: "not found",
        });
      }
      if (deleteCount === 1)
        return res.status(204).json({
          status: "failed",
          message: "deleted successfully",
        });
    })
    .catch((err) => {
      if (err)
        return next(new AppError("An error occurred please try again", 500));
    });
});

exports.getRating = async (req, res) => {
  console.log(req.params);
  const userId = req.params.userId;
  const sequelize = new Sequelize(databaseName, "root", "", {
    host: "localhost",
    dialect: "mysql",
  });
  let data = await sequelize.query(
    `SELECT 
  orders.rating as rating ,
  orders.rateDesc as content,
  orders.orderId AS orderId,
  DATE_FORMAT(orders.createdAt, '%m/%d/%Y') AS date,
  students.id AS id,
  students.image as image,
  users.username as reviewer,
  users.phoneNum as phoneNum
FROM 
  restaurants
  LEFT JOIN orders ON restaurants.id = orders.restaurantId
  LEFT JOIN students ON orders.studentId = students.id
  LEFT JOIN users ON students.userId = users.id
WHERE 
  restaurants.userId = ${userId} AND orders.rating != 0
`,

    {
      type: QueryTypes.SELECT,
      replacements: { localFormatter: localFormatter },
    }
  );
  res.status(200).json(data);
};
exports.setOpened = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("sss", userId);
    restaurant
      .update(
        { isOpen: Sequelize.literal("NOT isOpen") },
        { where: { userId } }
      )
      .then(([count]) => {
        if (count === 0) {
          console.log("NOO");
          return res.status(404).json({ status: "fail", message: "not found" });
        }
        return res
          .status(200)
          .json({ status: "success", message: "updated successfully" });
      });
  } catch (err) {
    console.log("my error", err);
    return res
      .status(500)
      .json({ status: "fail", message: "Internal server error" });
  }
};
