const AppError = require("../../utils/appError");
const { Op } = require("sequelize");
const Sequelize = require("sequelize");
const {
  order,
  orderItem,
  OrderItem_FoodItem,
  restaurant,
  foodItem,
  user,
  menu,
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
      status: "failed",
      message: "Not allowed action",
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
    status: "pending",
    totalPrice,
    notes: data.notes,
  });

  const orderItemData = data.orderItem;
  for (let item of orderItemData) {
    const fooditemPrice = await foodItem.findOne({
      where: { foodId: item.foodId },
      attributes: ["price", "offerPrice", "isOffer", "count"],
    });
    const count = fooditemPrice.count + 1;
    const unitPrice =
      item.Qauntity *
      (fooditemPrice.isOffer ? fooditemPrice.offerPrice : fooditemPrice.price);

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
          .then(() => {
            foodItem.update({ count }, { where: { foodId: item.foodId } });
          })
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
        status: "falied",
        message: "not allowed",
      });
    }
    console.log("the student", myStudent);
    const studentId = myStudent.id;
    let retrieveData = [];
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );
    const myOrders = await order.findAll({
      attributes: ["orderId", "status", "restaurantId", "totalPrice"],
      where: {
        studentId,
        createdAt: {
          [Op.gte]: startOfToday,
          [Op.lt]: endOfToday,
        },
        status: "on progress",
      },
      order: [["createdAt", "DESC"]],
    });
    if (!myOrders || myOrders.length === 0) {
      return res.status(404).json({
        status: "failed",
        message: "1You do not have any orders",
      });
    }
    console.log("MyOrders", myOrders);
    for (const myOrder of myOrders) {
      const data = {
        status: "",
        restaurantName: "",
        items: [],
        totalPrice: 0,
        orderId: "",
      };
      data.status = myOrder.status;
      data.totalPrice = myOrder.totalPrice;
      data.orderId = myOrder.orderId;
      const restaurants = await restaurant.findOne({
        attributes: ["userId"],
        where: { id: myOrder.restaurantId },
      });
      if (!restaurants)
        return res.status(404).json({
          status: "failed",
          message: "2You do not have any orders",
        });
      const restaurantUser = await user.findOne({
        attributes: ["username"],
        where: { id: restaurants.userId },
      });
      if (!restaurantUser)
        return res.status(404).json({
          status: "failed",
          message: "3You do not have any orders",
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
          message: "4You do not have any orders",
        });
      for (let i = 0; i < orderItems.length; i++) {
        const itemData = {
          Qauntity: "",
          unitPrice: "",
          price: "",
          nameOfFood: "",
          offerPrice: "",
          orderId: "",
        };
        const itemId = orderItems[i];
        itemData.Qauntity = itemId.Qauntity;
        itemData.unitPrice = itemId.unitPrice;
        console.log("orderItemId:", itemId.orderItemId);
        const records = await OrderItem_FoodItem.findOne({
          attributes: ["foodItemFoodId"],
          where: { orderItemOrderItemId: itemId.orderItemId },
        });
        console.log("11records Item with foodItemFoodId:", records);
        const foodItems = await foodItem.findOne({
          attributes: [
            "price",
            "nameOfFood",
            "offerPrice",
            "isOffer",
            "offerDesc",
          ],
          where: { foodId: records.foodItemFoodId },
        });
        console.log("food Items Item with price and name of food:", foodItems);
        itemData.price = foodItems.price;
        itemData.nameOfFood = foodItems.nameOfFood;
        console.log("Is offer", foodItems.isOffer);
        itemData.offerPrice = foodItems.isOffer
          ? foodItems.offerPrice
          : undefined;
        itemData.offerDesc = foodItems.isOffer
          ? foodItems.offerDesc
          : undefined;
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
exports.getOffers = catchAsync(async (req, res, next) => {
  const restaurantId = req.params.restaurantId;
  const myMenu = await menu.findOne({
    attributes: ["menuId"],
    where: { restaurantId },
  });
  if (!myMenu)
    return res.status(404).json({ status: "failed", message: "not found" });
  const menuMenuId = myMenu.menuId;
  const myOffers = await foodItem.findAll({
    attributes: [
      "foodId",
      "offerPrice",
      "offerDesc",
      "category",
      "nameOfFood",
      "price",
    ],
    where: { menuMenuId, isOffer: true },
  });
  if (!myOffers || myOffers.length === 0)
    return res.status(200).json({
      status: "failed",
      message: "no offers",
    });
  return res.status(200).json({ myOffers });
});
exports.getPoular = catchAsync(async (req, res, next) => {
  const data = [];
  const poular = await foodItem.findAll({
    attributes: [
      "foodId",
      "category",
      "nameOfFood",
      "price",
      "description",
      "menuMenuId",
      [Sequelize.fn("MAX", Sequelize.col("count")), "maxCount"],
    ],
    group: ["menuMenuId"],
    where: {
      count: {
        [Sequelize.Op.gt]: 0, // Exclude rows where count is 0
      },
    },
  });
  console.log("The poular", poular);
  if (!poular || poular.length === 0)
    return res.status(200).json({
      status: "failed",
      message: "no poular",
    });
  for (let item of poular) {
    const myMenu = await menu.findOne({
      attributes: ["restaurantId"],
      where: { menuId: item.menuMenuId },
    });
    const restu = await restaurant.findOne({
      attributes: ["userId"],
      where: { id: myMenu.restaurantId },
    });
    const myUser = await user.findOne({
      attributes: ["username"],
      where: { id: restu.userId },
    });
    const myData = {
      foodId: item.foodId,
      category: item.category,
      nameOfFood: item.nameOfFood,
      price: item.price,
      description: item.description,
      restaurantId: myMenu.restaurantId,
      name: myUser.username,
    };

    data.push(myData);
  }
  return res.status(200).json({ data });
});
