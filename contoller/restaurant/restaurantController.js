const AppError = require("../../utils/appError");
const {
  restaurant,
  menu,
  foodItem,
  user,
  student,
  orderItem,
  order,
  OrderItem_FoodItem,
} = require("../../models");
const catchAsync = require("../../utils/catchAsync");
const { UploadFile, getURL } = require("../../firebaseConfig");
exports.addFoodItem = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  const myRestaurant = await restaurant
    .findOne({ attributes: ["id"], where: { userId } })
    .then()
    .catch((err) => console.log("the err", err));
  if (!myRestaurant)
    return res.status(404).json({ status: "1failed", message: "not found" });
  const restaurantId = myRestaurant.id;
  const myMenu = await menu.findOne({ where: { restaurantId } });
  if (!myMenu)
    return res.status(404).json({ status: "2failed", message: "not found" });
  const menuId = myMenu.menuId;
  console.log("menuId: ", restaurantId);
  req.session.menuId = menuId;
  let myFoodItem = JSON.parse(req.body.data);
  const myImage = req.file;
  console.log("The image: ", myImage);
  console.log("The food", req.body);
  /*myFoodItem.menuMenuId = menuId;
  myFoodItem.image = myImage;*/
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
        if (data) resolve(data.foodId);
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

exports.getOrders = catchAsync(async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const ordersRestaurant = await restaurant.findOne({
      attributes: [],
      where: { userId },
      include: [
        {
          model: order,
          attributes: ["orderId", "status", "totalPrice", "createdAt"],
          // order: [["createdAt", "ASC"]],
          include: [
            {
              model: orderItem,
              attributes: ["orderItemId", "Qauntity", "unitPrice"],
              include: [
                { model: foodItem, attributes: ["price", "nameOfFood"] },
              ],
            },
            {
              model: student,
              include: [
                {
                  model: user,
                  attributes: ["username"],
                },
              ],
            },
          ],
        },
      ],
    });
    const { orders } = ordersRestaurant;
    let data = [];
    for (const order of orders) {
      const {
        orderItems,
        orderId,
        status,
        totalPrice,
        createdAt,
        student: {
          user: { username },
        },
      } = order;
      let items = [];
      for (const orderItem of orderItems) {
        const {
          foodItems: { price, nameOfFood },
          orderItemId,
          Qauntity,
          unitPrice,
        } = orderItem;
        const i = {
          orderItemId,
          Qauntity,
          unitPrice,
          price,
          nameOfFood,
        };
        items.push(i);
      }
      data.push({
        orderId,
        status,
        totalPrice,
        studentName: username,
        createdAt,
        items,
      });
    }

    if (data) {
      data = data.reverse();
      return res.status(200).json({ data });
    }
    return res.status(404).json({
      status: "failed",
      message: "not found",
    });
  } catch (err) {
    console.log("My err", err);
    return next(new AppError("An error occurred please try again", 500));
  }
});
exports.updateOrder = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const restaurantId = res.locals.restaurantId;
  let status = res.locals.status;
  status = status.trim().toLowerCase();
  switch (status) {
    case "pending":
      status = "recieved";
      break;
    case "recieved":
      status = "on process";
      break;
    case "on process":
      status = "ready";
      break;
    case "ready":
      status = "delivered";
      break;
    default:
      status = "pending";
      break;
  }
  await order
    .update({ status }, { where: { orderId, restaurantId } })
    .then((count) => {
      if (count[0] === 1)
        return res.status(200).json({
          status: "success",
          message: "status updated",
        });
      else if (count[0] === 0)
        return res
          .status(404)
          .json({
            status: "failed",
            message: "not found",
          })
          .catch((err) => {
            console.log(err);
            return next(
              new AppError("An error occurred please try again", 500)
            );
          });
    });
});
