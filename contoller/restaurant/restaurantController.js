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
const { UploadFile } = require("../../firebaseConfig");
const { resolve } = require("path");
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
  const id = await new Promise((resolve, reject) => {
    foodItem
      .create(myFoodItem)
      .then((data) => {
        if (data) resolve(data.id);
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
  const nameImage = `/images/foodItem/${id}_${myImage.originalname}`;
  UploadFile(myImage, nameImage);
  const image = await getURL(nameImage);
  foodItem.update({ image }, { where: id }).then((count) => {
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

  const myMenu = await menu.findOne({
    where: { restaurantId },
  });
  if (!myMenu)
    return res.status(404).json({
      status: "failed",
      message: "not found",
    });
  const data = await foodItem.findAll({
    attributes: [
      "foodId",
      "description",
      "price",
      "nameOfFood",
      "image",
      "category",
    ],
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
    const myRestaurant = await restaurant.findOne({
      attributes: ["id"],
      where: { userId },
    });
    if (!myRestaurant) {
      return res.status(403).json({
        status: "failed",
        message: "not allowed",
      });
    }
    //console.log("the student", myRestaurant);
    const restaurantId = myRestaurant.id;
    let retrieveData = [];
    const myOrders = await order.findAll({
      attributes: ["orderId", "status", "studentId", "totalPrice"],
      where: { restaurantId },
      order: [["createdAt", "DESC"]],
    });
    if (!myOrders || myOrders.length === 0) {
      return res.status(404).json({
        status: "failed",
        message: "You do not have any orders",
      });
    }
    console.log("MyOrders", myOrders);
    for (const myOrder of myOrders) {
      const data = {
        orderId: "",
        status: "",
        studentName: "",
        items: [],
        totalPrice: 0,
      };
      data.status = myOrder.status;
      data.totalPrice = myOrder.totalPrice;
      data.orderId = myOrder.orderId;
      const students = await student.findOne({
        attributes: ["userId"],
        where: { id: myOrder.studentId },
      });
      if (!students)
        return res.status(404).json({
          status: "failed",
          message: "You do not have any orders",
        });
      const studentUser = await user.findOne({
        attributes: ["username"],
        where: { id: students.userId },
      });
      if (!studentUser)
        return res.status(404).json({
          status: "failed",
          message: "You do not have any orders",
        });
      data.studentName = studentUser.username;
      /* console.log(
        "data with restaurant name: ",
        data.studentName,
        studentUser.username
      );*/

      const items = [];
      const orderItems = await orderItem.findAll({
        attributes: ["orderItemId", "Qauntity", "unitPrice"],
        where: { orderOrderId: myOrder.orderId },
      });
      if (!orderItems || orderItems.length === 0)
        return res.status(404).json({
          status: "failed",
          message: "You do not have any orders",
        });
      //console.log("oreders Item with quntity and unit price :", orderItems);
      for (let i = 0; i < orderItems.length; i++) {
        const itemData = {
          Qauntity: "",
          unitPrice: "",
          price: "",
          nameOfFood: "",
        };
        const itemId = orderItems[i];
        itemData.Qauntity = itemId.Qauntity;
        itemData.unitPrice = itemId.unitPrice;
        console.log("ordere item id:", itemId.orderItemId);
        const records = await OrderItem_FoodItem.findOne({
          attributes: ["foodItemFoodId"],
          where: { orderItemOrderItemId: itemId.orderItemId },
        });
        console.log("11records Item with foodItemFoodId:", records);
        if (!records) continue;

        const foodItems = await foodItem.findOne({
          attributes: ["price", "nameOfFood"],
          where: { foodId: records.foodItemFoodId },
        });
        // console.log("food Items Item with price and name of food:", foodItems);
        itemData.price = foodItems.price;
        itemData.nameOfFood = foodItems.nameOfFood;
        items.push(itemData);
      }
      console.log(items);
      data.items = items;
      console.log("my data:", data);
      retrieveData = [...retrieveData, data];
      // retrieveData.push(data);
      console.log("retrieveData:", retrieveData);
    }
    if (retrieveData) return res.status(200).json({ retrieveData });
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
