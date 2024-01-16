const AppError = require("../../utils/appError");
const {
  restaurant,
  menu,
  foodItem,
  user,
  student,
  order,
} = require("../../models");
const catchAsync = require("../../utils/catchAsync");
const { UploadFile, getURL, deleteFile } = require("../../firebaseConfig");
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
  let myFoodItem = JSON.parse(req.body.data);
  const myImage = req.file;
  console.log("The image: ", myImage);
  console.log("The food", req.body);
  myFoodItem = {
    ...myFoodItem,
    menuMenuId: menuId,
  };
  let status = false;
  const foodId = await new Promise((resolve, reject) => {
    foodItem
      .create(myFoodItem)
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
      if (count[0] === 1)
        return res
          .status(201)
          .json({ status: "success", message: "created successfully" });
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
          where: { menuMenuId },
        })
        .then((record) => {
          console.log("data:", record);
          resolve(record);
        })
        .catch((err) => reject(err));
    });
    return res.status(200).json(data);
    /* const data = await menu.findOne({
      where: { restaurantId },
      attributes: [],
      include: [
        {
          model: foodItem,
          attributes: [
            "foodId",
            "description",
            "price",
            "nameOfFood",
            "image",
            "category",
          ],
        },
      ],
    });*/
    /* if (!data)
    return res.status(200).json({
      status: "success",
      data: [],
    });
    const { foodItems } = data;
    res.status(200).json({
      status: "success",
      data: foodItems,
    });*/
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
  const myImage = req.file;
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
  let data = await new Promise((resolve) => {
    restaurant
      .findOne({
        where: { userId },
        attributes: [],
        include: [
          {
            model: order,
            attributes: ["rating"],
            include: [
              {
                model: student,
                attributes: ["id"],
                include: [
                  {
                    model: user,
                    attributes: ["username", "phoneNum"],
                  },
                ],
              },
            ],
          },
        ],
      })
      .then((record) => {
        resolve(record);
      });
  });
  const { orders } = data;
  data = orders.map((item) => {
    const {
      rating,
      student: {
        user: { username, phoneNum },
      },
    } = item;
    return { rating, username, phoneNum };
  });
  res.status(200).json(data);
};
