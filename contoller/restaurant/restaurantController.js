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
  myFoodItem.image = myImage;
  myFoodItem = {
    ...myFoodItem,
    menuMenuId: menuId,
    isOffer: false,
    offerPrice: 0,
    offerDesc: "",
  };
  const foodId = await new Promise((resolve, reject) => {
    foodItem
      .create(myFoodItem)
      .then((data) => {
        //if (data) resolve(data.foodId);
        return res
          .status(201)
          .json({ status: "success", message: "created successfully" });
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
  /*const nameImage = `/foodItem/${foodId}`;
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
  });*/
});
exports.getMenu = catchAsync(async (req, res, next) => {
  let restaurantId = req.params.restaurantId;
  if (!restaurantId) {
    const userId = req.params.userId;
    const myUser = await restaurant.findOne({
      attributes: ["id"],
      where: { userId },
    });
    restaurantId = myUser.id;
  }

  const data = await menu.findOne({
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
  });
  if (!data)
    return res.status(404).json({
      status: "failed",
      message: "not found",
    });
  const { foodItems } = data;
  res.status(200).json({
    status: "success",
    data: foodItems,
  });
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
