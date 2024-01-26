const AppError = require("../../utils/appError");
const { Op } = require("sequelize");
const paypal = require("paypal-rest-sdk");

paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id: process.env.PAYPAL_CLIENT_KEY,
  client_secret: process.env.PAYPAL_SECRET_KEY,
});
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
    const menuMenuId = await new Promise((resolve, reject) => {
      menu
        .findOne({ where: { restaurantId }, attributes: ["menuId"] })
        .then((record) => resolve(record.menuId))
        .catch((err) => reject(err));
    });

    const foodIds = data.orderItem.map((item) => parseInt(item.foodId));
    const status = await new Promise((resolve, reject) => {
      foodItem
        .findAll({
          where: { menuMenuId },
        })
        .then((result) => {
          const availableFoodIds = result.map((food) => food.foodId);
          console.log(availableFoodIds);
          console.log(foodIds);
          const allIncluded = foodIds.every((id) =>
            availableFoodIds.includes(id)
          );
          resolve(allIncluded);
        })
        .catch((error) => reject(error));
    });
    if (!status)
      return res
        .status(400)
        .json({ status: "failed", message: "not avalible food in this menu" });
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
      paymentType: "on receive",
    });

    const orderItemData = data.orderItem;
    for (let item of orderItemData) {
      const fooditemPrice = await foodItem.findOne({
        where: { foodId: item.foodId, menuMenuId },
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
const createOrderPaybal = async (body, userId) => {
  try {
    const data = body;
    console.log("Hiii", data, userId);
    const myStudent = await student.findOne({
      attributes: ["id"],
      where: { userId },
    });
    if (!myStudent) {
      console.log("1");
      return { success: false };
    }
    const studentId = myStudent.id;
    const restaurantId = await new Promise((resolve, reject) => {
      restaurant
        .findOne({ where: { userId: data.restaurantId }, attributes: ["id"] })
        .then((record) => resolve(record.id))
        .catch((err) => reject(err));
    });
    const menuMenuId = await new Promise((resolve, reject) => {
      menu
        .findOne({ where: { restaurantId }, attributes: ["menuId"] })
        .then((record) => resolve(record.menuId))
        .catch((err) => reject(err));
    });

    const foodIds = data.orderArr.map((item) => parseInt(item.foodId));
    const status = await new Promise((resolve, reject) => {
      foodItem
        .findAll({
          where: { menuMenuId },
        })
        .then((result) => {
          const availableFoodIds = result.map((food) => food.foodId);
          console.log(availableFoodIds);
          console.log(foodIds);
          const allIncluded = foodIds.every((id) =>
            availableFoodIds.includes(id)
          );
          resolve(allIncluded);
        })
        .catch((error) => reject(error));
    });
    if (!status) {
      console.log("2");
      return { success: false };
    }
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
      paymentType: "paypal",
    });

    const orderItemData = data.orderArr;
    let orders = [];

    for (let item of orderItemData) {
      const fooditemPrice = await foodItem.findOne({
        where: { foodId: item.foodId, menuMenuId },
        attributes: ["price", "count"],
      });
      const count = fooditemPrice.count + 1;
      const unitPrice = item.Qauntity * fooditemPrice.price;
      totalPrice += unitPrice;
      const orderItems = await new Promise((resolve, reject) => {
        orderItem
          .create({
            Qauntity: item.Qauntity,
            unitPrice,
            orderOrderId: myOrders.orderId,
          })
          .then((myItems) => {
            resolve(myItems);
          })
          .catch((err) => {
            reject(err);
            console.log(err);
            return next(new AppError("An error ouccured please try agin", 500));
          });
      });
      orders.push({
        name: "item",
        sku: "item",
        price: fooditemPrice.price,
        quantity: item.Qauntity,
        currency: "ILS",
      });

      await OrderItem_FoodItem.create({
        foodItemFoodId: item.foodId,
        orderItemOrderItemId: orderItems.orderItemId,
      })
        .then(() => {
          foodItem.update({ count }, { where: { foodId: item.foodId } });
        })
        .catch((err) => {
          throw err;
        });
      countOrder++;
    }
    console.log("zz", orders);
    if (countOrder === data.orderArr.length) {
      return await order
        .update({ totalPrice }, { where: { orderId: myOrders.orderId } })
        .then(() => {
          const data = {
            success: true,
            totalPrice,
            itemsArray: orders,
            orderId: myOrders.orderId,
          };
          return data;
        })
        .catch((err) => {
          console.log("3");
          return { success: false };
        });
    }
  } catch (err) {
    console.log(err);
    console.log("5");
    return { success: false };
  }
};
exports.getOrders = catchAsync(async (req, res, next) => {
  try {
    const userId = req.params.userId;
    let condition = {};
    let limit = 5;
    const { stringDate } = req.query;
    if (stringDate) {
      const date = new Date(stringDate);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      condition = {
        ...condition,
        createdAt: { [Op.gte]: date, [Op.lt]: nextDate },
      };
      limit = null;
    }
    const studentOrders = await student.findOne({
      where: { userId },
      include: [
        {
          model: order,
          limit,
          where: condition,
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
          separate: true, // Use separate to apply limit to orders, not the student record
          order: [["createdAt", "DESC"]], // Keep descending order
        },
      ],
    });
    console.log(studentOrders);
    if (!studentOrders) {
      return res.status(200).json([]);
    }
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
      console.log("GG", data);

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
        [Sequelize.Op.gt]: 0,
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
  try {
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
    const count = await new Promise((resolve, reject) => {
      order
        .update(data, { where: { studentId, orderId } })
        .then((count) => {
          resolve(count[0]);
        })
        .catch((err) => reject(err));
    });
    if (count === 1) {
      const { restaurantId, oldRate } = await new Promise((resolve, reject) => {
        order
          .findOne({
            where: { orderId },
            attributes: ["restaurantId"],
            include: [
              {
                model: restaurant,
                attributes: ["rating"],
              },
            ],
          })
          .then((record) => {
            console.log(record);
            const restaurantId = record.restaurantId;
            const oldRate = record.restaurant.rating;

            const data = { restaurantId, oldRate };
            resolve(data);
          })
          .catch((err) => reject(err));
      });
      console.log(data.rating);

      const newRate = oldRate === 0 ? data.rating : (oldRate + data.rating) / 2;
      const count = await new Promise((resolve, reject) => {
        restaurant
          .update({ rating: newRate }, { where: { id: restaurantId } })
          .then((count) => {
            resolve(count[0]);
          })
          .catch((err) => reject(err));
      });
      if (count === 1)
        return res
          .status(200)
          .json({ status: "success", message: "rating successfully" });
      return res.status(404).json({ status: "failed", message: "not found" });
    } else
      return res.status(404).json({ status: "failed", message: "not found" });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: "failed", message: "Internal Server Error" });
  }
});

const cancelOrder = async (orderId, userId) => {
  try {
    const restaurantId = await new Promise((resolve, reject) => {
      restaurant
        .findOne({ where: { userId } })
        .then((res) => {
          resolve(res.id);
        })
        .catch((err) => reject(err));
    });
    const count = await new Promise((resolve, reject) => {
      orderItem
        .destroy({ where: { orderOrderId: orderId } })
        .then((count) => {
          resolve(count);
        })
        .catch((err) => reject(err));
    });

    if (count === 1) {
      const count = await new Promise((resolve, reject) => {
        order
          .destroy({ where: { orderId, restaurantId } })
          .then((count) => {
            resolve(count);
          })
          .catch((err) => reject(err));
      });
      console.log(count);
      console.log(orderId, restaurantId);
      if (count === 1) return { status: true };
      else return { status: false };
    }
    return { status: false };
  } catch (err) {
    return { status: false };
  }
};

exports.paypalOrder = async (req, res) => {
  const data = req.body;
  const { userId } = req.params;
  console.log(data, userId);
  const { restaurantId } = data.restaurantId;
  data.orderArr = JSON.parse(data.orderArr);
  const resp = await createOrderPaybal(data, userId);
  console.log("FK", resp);
  const { itemsArray, success, totalPrice, orderId } = resp;
  try {
    var create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url:
          "http://192.168.1.8:3000/api/v1/unilife/payment/order/success",
        cancel_url:
          "http://192.168.1.8:3000/api/v1/unilife/payment/order/cancel",
      },
      transactions: [
        {
          item_list: {
            items: itemsArray,
          },
          amount: {
            currency: "ILS",
            total: totalPrice,
          },
          description: "This is the payment description.",
        },
      ],
    };

    await new Promise((resolve, reject) => {
      paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
          console.log("gg", error.response.details);
          cancelOrder(orderId, restaurantId);

          reject(error);
          res.redirect("cancel");
        } else {
          const locale = "en_US";
          console.log("Create Payment Response");
          console.log(payment);
          console.log(payment.links[1].href);
          req.session.price = totalPrice;
          res.redirect(payment.links[1].href);
        }
      });
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "failed", message: "Internall Server Error" });
  }
};
exports.paypalExecute = (req, res) => {
  try {
    const { PayerID, paymentId } = req.query;
    console.log("gg");
    const execute_payment_json = {
      payer_id: PayerID,
      transactions: [
        {
          amount: {
            currency: "ILS",
            total: req.session.price,
          },
        },
      ],
    };

    paypal.payment.execute(
      paymentId,
      execute_payment_json,
      function (error, payment) {
        if (error) {
          console.log(error.response);
          res.render("cancelled");
          throw error;
        } else {
          console.log("Get Payment Response");
          console.log(JSON.stringify(payment));
          res.render("success");
        }
      }
    );
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "failed", message: "Internal Server Error" });
  }
};
