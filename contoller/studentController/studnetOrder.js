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
    const studentOrders = await student.findOne({
      where: { userId },
      include: [
        {
          model: order,
          attributes: ["orderId", "status", "totalPrice"],
          include: [
            {
              model: orderItem,
              attributes: ["orderItemId", "Qauntity", "unitPrice"],
              include: [
                {
                  model: foodItem,
                  attributes: [
                    "price",
                    "nameOfFood",
                    "offerPrice",
                    "isOffer",
                    "offerDesc",
                  ],
                },
              ],
            },
            {
              model: restaurant,
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
        restaurant: {
          user: { username },
        },
      } = order;
      let items = [];
      for (const orderItem of orderItems) {
        const {
          foodItems: { price, nameOfFood, offerPrice, isOffer, offerDesc },
          orderItemId,
          Qauntity,
          unitPrice,
        } = orderItem;
        let actuaLprice = isOffer ? offerPrice : price;
        const i = {
          orderItemId,
          Qauntity,
          unitPrice,
          price: actuaLprice,
          nameOfFood,
          offerDesc,
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
