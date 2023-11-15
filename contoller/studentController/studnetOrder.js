const AppError = require("../../utils/appError");
const {
  order,
  orderItem,
  OrderItem_FoodItem,
  restaurant,
  foodItem,
  user,
  student,
} = require("../../models");
const catchAsync = require("../../utils/catchAsync");
exports.createOrder = catchAsync(async (req, res, next) => {
  const data = req.body;
  const userId = req.params.userId;
  const myStudent = await student.findOne({
    attributes: ["id"],
    where: { userId },
  });
  if (!myStudent) {
    return res.status(403).json({
      status: "Not allowed action",
      message: "Something went wrong please try again",
    });
  }
  const studentId = myStudent.id;
  console.log("myData", data);
  console.log("studentId:", studentId);
  let countOrder = 0;
  let totalPrice = 0;
  const myOrders = await order.create({
    restaurantId: data.restaurantId,
    studentId,
    status: "on progress",
    totalPrice,
  });

  const orderItemData = data.orderItem;
  for (let item of orderItemData) {
    const fooditemPrice = await foodItem.findOne({
      where: { foodId: item.foodId },
      attributes: ["price"],
    });
    const unitPrice = fooditemPrice.price * item.Qauntity;

    totalPrice += unitPrice;
    orderItem
      .create({
        Qauntity: item.Qauntity,
        unitPrice,
        orderOrderId: myOrders.orderId,
      })
      .then((myItems) => {
        OrderItem_FoodItem.create({
          foodItemFoodId: item.foodId,
          orderItemOrderItemId: myItems.orderItemId,
        })
          .then(() => {})
          .catch((err) => {
            console.log(err);
            return next(new AppError("An error ouccured please try agin", 500));
          });
      })
      .catch((err) => {
        console.log(err);
        return next(new AppError("An error ouccured please try agin", 500));
      });
    countOrder++;
  }

  if (countOrder === data.orderItem.length) {
    order
      .update({ totalPrice }, { where: { orderId: myOrders.orderId } })
      .then(() => {
        return res.status(201).json({
          status: "success",
          message: "created successfully",
        });
      })
      .catch((err) => {
        console.log(err);
        return next(new AppError("An error ouccured please try agin", 500));
      });
  }
});
exports.getOrders = catchAsync(async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const myStudent = await student.findOne({
      attributes: ["id"],
      where: { userId },
    });
    if (!myStudent) {
      return res.status(403).json({
        status: "Not allowed action",
        message: "Something went wrong please try again",
      });
    }
    console.log("the student", myStudent);
    const studentId = myStudent.id;
    let retrieveData = [];
    const myOrders = await order.findAll({
      attributes: ["orderId", "status", "restaurantId", "totalPrice"],
      where: { studentId },
    });
    if (!myOrders || myOrders.length === 0) {
      return res.status(404).json({
        status: "failed",
        message: "You do not have any orders",
      });
    }
    console.log("MyOrders", myOrders);
    for (const myOrder of myOrders) {
      const data = { status: "", restaurantName: "", items: [], totalPrice: 0 };
      data.status = myOrder.status;
      data.totalPrice = myOrder.totalPrice;
      const restaurants = await restaurant.findOne({
        attributes: ["userId"],
        where: { id: myOrder.restaurantId },
      });
      if (!restaurants)
        return res.status(404).json({
          status: "failed",
          message: "You do not have any orders",
        });
      const restaurantUser = await user.findOne({
        attributes: ["username"],
        where: { id: restaurants.userId },
      });
      if (!restaurantUser)
        return res.status(404).json({
          status: "failed",
          message: "You do not have any orders",
        });
      data.restaurantName = restaurantUser.username;
      console.log(
        "data with restaurant name: ",
        data.restaurantName,
        restaurantUser.username
      );

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
      console.log("oreders Item with quntity and unit price :", orderItems);
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
        const records = await OrderItem_FoodItem.findOne({
          attributes: ["foodItemFoodId"],
          where: { orderItemOrderItemId: itemId.orderItemId },
        });
        console.log("reords Item with foodItemFoodId:", records);
        const foodItems = await foodItem.findOne({
          attributes: ["price", "nameOfFood"],
          where: { foodId: records.foodItemFoodId },
        });
        console.log("food Items Item with price and name of food:", foodItems);
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
