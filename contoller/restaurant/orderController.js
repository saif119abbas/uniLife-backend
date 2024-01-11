const AppError = require("../../utils/appError");
const {
  restaurant,
  foodItem,
  user,
  student,
  orderItem,
  order,
} = require("../../models");
const catchAsync = require("../../utils/catchAsync");
const { UploadFile, getURL } = require("../../firebaseConfig");
const { Op, Sequelize, QueryTypes } = require("sequelize");
const { count } = require("firebase/firestore");
exports.getOrders = catchAsync(async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const ordersRestaurant = await restaurant.findOne({
      attributes: [],
      where: { userId },
      include: [
        {
          model: order,
          attributes: ["orderId", "status", "totalPrice", "createdAt", "notes"],
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
                  attributes: ["username", "phoneNum"],
                },
              ],
            },
          ],
        },
      ],
    });
    const { orders } = ordersRestaurant;
    console.log(orders.orderItems);
    let data = [];
    for (const order of orders) {
      const {
        orderItems,
        orderId,
        status,
        totalPrice,
        createdAt,
        notes,
        student: {
          user: { username, phoneNum },
        },
      } = order;
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
        id: orderId,
        phoneNum,
        status,
        totalPrice,
        studentName: username,
        createdAt,
        notes,
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
  const { orderId, userId } = req.params;
  let { status, restaurantId } = await new Promise((resolve) => {
    restaurant
      .findOne({
        where: { userId },
        attributes: ["id"],
        include: [{ model: order, attributes: ["status"], where: { orderId } }],
      })
      .then((record) => {
        const data = {
          restaurantId: record.id,
          status: record.orders[0].status,
        };
        resolve(data);
      });
  });
  status = status.trim().toLowerCase();
  switch (status) {
    case "pending":
      status = "received";
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
exports.weeklyDashboard = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  const upper = new Date();
  const lower = new Date();
  lower.setDate(lower.getDate() - 6);
  const upperLastWeek = new Date(lower);
  upperLastWeek.setDate(upperLastWeek.getDate() - 1);
  const lowerLastWeek = new Date(upperLastWeek);
  lowerLastWeek.setDate(lowerLastWeek.getDate() - 6);
  //lower.setDate(upper.getDate() - 7);
  const totalPrices1 = await new Promise((resolve) => {
    restaurant
      .findOne({
        where: { userId },
        attributes: [],
        include: [
          {
            model: order,
            attributes: ["totalPrice"],
            where: {
              createdAt: {
                [Op.gte]: lower,
                [Op.lte]: upper,
              },
            },
          },
        ],
      })
      .then((record) => {
        resolve(record?.orders.map((order) => order.totalPrice) || []);
      });
  });
  // res.status(200).json(totalPrices1);
  const totalPrices2 = await new Promise((resolve) => {
    restaurant
      .findOne({
        where: { userId },
        attributes: [],
        include: [
          {
            model: order,
            attributes: ["totalPrice"],
            where: {
              createdAt: {
                [Op.gte]: lowerLastWeek,
                [Op.lte]: upperLastWeek,
              },
            },
          },
        ],
      })
      .then((record) => {
        resolve(record?.orders.map((order) => order.totalPrice) || []);
      });
  });
  // res.status(200).json(totalPrices2);
  const revenue = totalPrices1.reduce((accumulator, currentValue) => {
    return accumulator + currentValue;
  }, 0);
  const revenueLastWeek =
    !totalPrices2 || totalPrices2.length === 0
      ? 0
      : totalPrices2.reduce((accumulator, currentValue) => {
          return accumulator + currentValue;
        }, 0);
  const perc = `${
    !totalPrices2 || totalPrices2.length === 0
      ? 0
      : Math.round(((revenue - revenueLastWeek) / revenueLastWeek) * 100)
  }%`;
  const data = {
    revenue,
    perc,
  };
  res.status(200).json(data);
});
exports.dailyDashboard = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  const upper = new Date();
  const lower = new Date();
  lower.setDate(lower.getDate() - 1);
  const upperLastDay = new Date(lower);
  const totalPrices1 = await new Promise((resolve) => {
    restaurant
      .findOne({
        where: { userId },
        attributes: [],
        include: [
          {
            model: order,
            attributes: ["totalPrice"],
            where: {
              createdAt: {
                [Op.gte]: lower,
                [Op.lt]: upper,
              },
            },
          },
        ],
      })
      .then((record) => {
        resolve(record?.orders.map((order) => order.totalPrice) || []);
      });
  });
  // res.status(200).json(totalPrices1);
  const totalPrices2 = await new Promise((resolve) => {
    restaurant
      .findOne({
        where: { userId },
        attributes: [],
        include: [
          {
            model: order,
            attributes: ["totalPrice"],
            where: {
              createdAt: {
                [Op.gte]: upperLastDay,
                [Op.lt]: lower,
              },
            },
          },
        ],
      })
      .then((record) => {
        resolve(record?.orders.map((order) => order.totalPrice) || []);
      });
  });
  // res.status(200).json(totalPrices2);
  const revenue = totalPrices1.reduce((accumulator, currentValue) => {
    return accumulator + currentValue;
  }, 0);
  const revenueLastDay =
    !totalPrices2 || totalPrices2.length === 0
      ? 0
      : totalPrices2.reduce((accumulator, currentValue) => {
          return accumulator + currentValue;
        }, 0);
  const perc = `  ${
    !totalPrices2 || totalPrices2.length === 0
      ? 0
      : ((revenue - revenueLastDay) / revenueLastDay) * 100
  }%`;
  const data = { revenue, perc };
  res.status(200).json(data);
});
exports.totalPeople = async (req, res, next) => {
  const userId = req.params.userId;
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const count = await new Promise((resolve) => {
    order
      .count({
        where: {
          createdAt: {
            [Op.gte]: sevenDaysAgo,
          },
        },
        distinct: true,
        col: "studentId",
        include: [{ model: restaurant, where: { userId }, attributes: [] }],
      })
      .then((count) => {
        resolve(count);
      });
  });
  res.status(200).json({ count });
};
exports.newCustomer = async (req, res, next) => {
  const userId = req.params.userId;
  const upper = new Date();
  const lower = new Date();
  lower.setDate(lower.getDate() - 6);
  const upperLastWeek = new Date(lower);
  upperLastWeek.setDate(upperLastWeek.getDate() - 1);
  const lowerLastWeek = new Date(upperLastWeek);
  lowerLastWeek.setDate(lowerLastWeek.getDate() - 6);
  console.log(upper, lower, upperLastWeek, lowerLastWeek);
  const data = await new Promise((resolve) => {
    order
      .count({
        where: {
          createdAt: {
            [Op.gte]: lower,
            [Op.lte]: upper,
            [Op.notIn]: [lowerLastWeek, upperLastWeek],
          },
        },
        distinct: true,
        col: "studentId",
        include: [{ model: restaurant, where: { userId }, attributes: [] }],
        studentId: {
          [Op.notIn]: order.sequelize.literal(`
        SELECT "studentId" FROM orders
            WHERE "createdAt" >= '${lowerLastWeek.toISOString()}'
            AND "createdAt" <= '${upperLastWeek.toISOString()}'
          `),
        },
      })
      .then((count) => {
        resolve(count);
      });
  });
  res.status(200).json({ data });
};
exports.totalOrder = async (req, res, next) => {
  const userId = req.params.userId;
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const count = await new Promise((resolve) => {
    order
      .count({
        where: {
          createdAt: {
            [Op.gte]: sevenDaysAgo,
          },
        },
        col: "studentId",
        include: [{ model: restaurant, where: { userId }, attributes: [] }],
      })
      .then((count) => {
        resolve(count);
      });
  });
  res.status(200).json({ count });
};
exports.foodLastWeek = async (req, res, next) => {
  const userId = req.params.userId;
  const sequelize = new Sequelize("uniLife2", "root", "", {
    host: "localhost",
    dialect: "mysql",
  });
  const upper = new Date();
  const lower = new Date();
  lower.setDate(lower.getDate() - 6);
  const data = await sequelize.query(
    `SELECT
    foodItem.nameOfFood,
    foodItem.createdAt,
    COUNT(OI_FI.orderItemOrderItemId) AS orderCount
  FROM
    foodItems AS foodItem
    LEFT JOIN orderitem_fooditems AS OI_FI  ON foodItem.foodId = OI_FI.foodItemFoodId
    LEFT JOIN orderItems AS OI ON OI_FI.orderItemOrderItemId = OI.orderItemId
    LEFT JOIN orders AS o ON OI.orderOrderId  = o.orderId 
    LEFT JOIN restaurants AS r ON o.restaurantId = r.id
  WHERE
    o.createdAt BETWEEN :lower AND :upper
    AND r.userId = :userId
  GROUP BY
    foodItem.foodId
  ORDER BY
    orderCount DESC
  LIMIT 5;
  `,
    {
      replacements: {
        lower,
        upper,
        userId,
      },
      type: QueryTypes.SELECT,
    }
  );

  res.status(200).json({ data });
};
exports.lastReviewer = async (req, res, next) => {
  const { userId } = req.params;

  try {
    const data = await order.findOne({
      attributes: ["createdAt", "rating", "rateDesc"],
      where: {
        rating: {
          [Op.not]: null,
        },
      },
      include: [
        {
          model: restaurant,
          attributes: [],
          where: { userId },
        },
        {
          model: student,
          attributes: ["image"],
          include: [
            {
              model: user,
              attributes: ["username"],
            },
          ],
        },
      ],
    });

    if (!data) {
      return res.status(404).json({ error: "Record not found" });
    }

    const {
      createdAt,
      rating,
      rateDesc,
      student: {
        image,
        user: { username },
      },
    } = data;

    const responseData = {
      date: createdAt,
      rating,
      content: rateDesc,
      image,
      reviewer: username,
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
