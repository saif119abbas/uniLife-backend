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
  try {
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
    const restaurantId = await new Promise((resolve, reject) => {
      restaurant
        .findOne({ where: { userId: data.restaurantId }, attributes: ["id"] })
        .then((record) => resolve(record.id))
        .catch((err) => reject(err));
    });
    console.log("myData", data);
    console.log("studentId:", studentId);
    let countOrder = 0;
    let totalPrice = 0;
    const myOrders = await order.create({
      restaurantId,
      studentId,
      status: "PENDING",
      totalPrice,
      notes: data.notes,
    });

    const orderItemData = data.orderItem;
    for (let item of orderItemData) {
      const fooditemPrice = await foodItem.findOne({
        where: { foodId: item.foodId },
        attributes: ["price", "count"],
      });
      const count = fooditemPrice.count + 1;
      const unitPrice = item.Qauntity * fooditemPrice.price;
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
              return next(
                new AppError("An error ouccured please try agin", 500)
              );
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
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});
exports.getOrders = catchAsync(async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const studentOrders = await student.findOne({
      where: { userId },
      include: [
        {
          model: order,
          limit: 5,
          order: [["createdAt", "DESC"]],
          attributes: [
            "orderId",
            "status",
            "totalPrice",
            "createdAt",
            "rating",
          ],
          include: [
            {
              model: orderItem,
              attributes: ["orderItemId", "Qauntity", "unitPrice"],
              include: [
                {
                  model: foodItem,
                  attributes: ["price", "nameOfFood"],
                },
              ],
            },
            {
              model: restaurant,
              // attributes: [],
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
    const { orders } = studentOrders;
    let data = [];
    for (const order of orders) {
      const {
        orderItems,
        orderId,
        status,
        totalPrice,
        createdAt,
        rating,
        restaurant: {
          user: { username },
        },
      } = order;
      console.log(order);
      let items = [];
      for (const orderItem of orderItems) {
        const { foodItems, orderItemId, Qauntity, unitPrice } = orderItem;
        const { price, nameOfFood } = foodItems[0];
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
        restaurantName: username,
        createdAt,
        items,
        rating,
      });
    }
    if (data) {
      data = data.reverse();
      return res.status(200).json(data);
    }
    return res.status(404).json({
      status: "failed",
      message: "not found",
    });
  } catch (err) {
    console.log("My err", err);
    return res.status(500).json({
      status: "failed",
      message: "Internal Server Error",
    });
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
    attributes: ["foodId", "category", "nameOfFood", "price"],
    where: { menuMenuId, category: "offer" },
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
    return res.status(404).json({
      status: "failed",
      message: "no poular",
    });
  for (let item of poular) {
    const myMenu = await menu.findOne({
      attributes: ["restaurantId"],
      where: { menuId: item.menuMenuId },
    });
    console.log("item:", item);
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
exports.rate = catchAsync(async (req, res, next) => {
  const orderId = req.params.orderId;
  const userId = req.params.userId;
  const data = req.body;
  const studentId = await new Promise((resolve) => {
    student
      .findOne({ where: { userId }, attributes: ["id"] })
      .then((record) => {
        resolve(record.id);
      });
  });
  order.update(data, { where: { studentId, orderId } }).then((count) => {
    if (count[0] === 1)
      return res
        .status(200)
        .json({ status: "success", message: "rating successfully" });
    return res.status(404).json({ status: "failed", message: "not found" });
  });
});
