const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const {
  restaurant,
  user,
  post,
  order,
  dormitoryPost,
  report,
} = require("../../models");
const { Op, Sequelize, QueryTypes } = require("sequelize");
const databaseName = require("../../databaseName");
exports.totalUsers = async (_, res) => {
  try {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 2);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    const totalUsers = await new Promise((resolve, reject) => {
      user
        .count({
          where: {
            createdAt: {
              [Op.gte]: sevenDaysAgo,
            },
          },
          distinct: true,
          col: "id",
        })
        .then((count) => resolve(count))
        .catch((err) => reject(err));
    });
    const oldUser = await new Promise((resolve, reject) => {
      user
        .count({
          where: {
            createdAt: {
              [Op.lt]: sevenDaysAgo,
            },
          },
          distinct: true,
          col: "id",
        })
        .then((count) => resolve(count))
        .catch((err) => reject(err));
    });
    return res.status(200).json({ totalUsers, oldUser });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: "failed", message: "Internal Server Error" });
  }
};
exports.totalPost = async (_, res) => {
  try {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 7);
    yesterday.setHours(0, 0, 0, 0);

    const totalPosts = await new Promise((resolve, reject) => {
      post
        .count({
          where: {
            createdAt: {
              [Op.lt]: today,
              [Op.gte]: yesterday,
            },
          },
          distinct: true,
          col: "id",
        })
        .then((count) => resolve(count))
        .catch((err) => reject(err));
    });
    const oldPost = await new Promise((resolve, reject) => {
      post
        .count({
          where: {
            createdAt: {
              [Op.lt]: yesterday,
            },
          },
          distinct: true,
          col: "id",
        })
        .then((count) => resolve(count))
        .catch((err) => reject(err));
    });
    return res.status(200).json({ totalPosts, oldPost });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: "failed", message: "Internal Server Error" });
  }
};
exports.popularRestaurant = async (_, res) => {
  try {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 2);
    lastWeek.setHours(0, 0, 0, 0);
    const sequelize = new Sequelize(databaseName, "root", "", {
      host: "localhost",
      dialect: "mysql",
    });
    const data = await sequelize.query(
      `SELECT
      r.id,
      r.userId,
      r.image,
      r.rating,
      r.restaurantDesc,
      u.username,
      u.phoneNum,
      
      COUNT(o.restaurantId) AS orderCount
    FROM
      restaurants as r
    LEFT JOIN
      orders o ON r.id = o.restaurantId 
    JOIN
      users u ON r.userId = u.id
    WHERE
      o.createdAt BETWEEN :lastWeek AND :today
    GROUP BY
      r.id
    ORDER BY
      orderCount DESC
      ;
  
  `,

      {
        replacements: {
          today,
          lastWeek,
        },
        type: QueryTypes.SELECT,
      }
    );
    return res.status(200).json(data);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: "failed", message: "Internal Server Error" });
  }
};
exports.topRestaurant = async (_, res) => {
  try {
    const data = await new Promise((resolve, reject) => {
      restaurant
        .findAll({
          attributes: ["id", "image", "userId", "rating", "restaurantDesc"],
          order: [["rating", "DESC"]],
          limit: 2,
          include: [
            { model: user, attributes: ["username", "email", "phoneNum"] },
          ],
        })
        .then((record) => resolve(record))
        .catch((err) => reject(err));
    });
    let retrivedData = data.map((item) => ({
      ...item.get(),
      username: item.user.username,
      email: item.user.email,
      phoneNum: item.user.phoneNum,
      user: undefined,
    }));
    return res.status(200).json(retrivedData);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: "failed", message: "Internal Server Error" });
  }
};
exports.dormitoryPostCount = async (_, res) => {
  try {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    lastWeek.setHours(0, 0, 0, 0);
    const count = await new Promise((resolve, reject) => {
      dormitoryPost
        .count({
          where: {
            createdAt: {
              [Op.lt]: today,
              [Op.gte]: lastWeek,
            },
          },
          distinct: true,
          col: "id",
        })
        .then((count) => resolve(count))
        .catch((err) => reject(err));
    });

    return res.status(200).json(count);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: "failed", message: "Internal Server Error" });
  }
};

exports.reportedPostCount = async (_, res) => {
  try {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const count = await new Promise((resolve, reject) => {
      report
        .count({
          where: {
            createdAt: {
              [Op.lt]: today,
              [Op.gte]: yesterday,
            },
          },
          distinct: true,
          col: "id",
        })
        .then((count) => resolve(count))
        .catch((err) => reject(err));
    });

    return res.status(200).json(count);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: "failed", message: "Internal Server Error" });
  }
};
