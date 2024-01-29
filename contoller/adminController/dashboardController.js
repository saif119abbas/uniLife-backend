const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const {
  restaurant,
  user,
  post,
  order,
  dormitoryPost,
  report,
  student,
} = require("../../models");
const { Op, Sequelize, QueryTypes } = require("sequelize");
const databaseName = require("../../databaseName");
exports.totalUsers = async (_, res) => {
  try {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    const totalUsers = await new Promise((resolve, reject) => {
      student
        .count({
          where: {
            createdAt: {
              [Op.gte]: sevenDaysAgo,
            },
          },

          col: "id",
        })
        .then((count) => resolve(count))
        .catch((err) => reject(err));
    });
    const allUsers = await new Promise((resolve, reject) => {
      student
        .count({
          col: "id",
        })
        .then((count) => resolve(count))
        .catch((err) => reject(err));
    });

    return res.status(200).json({ totalUsers, allUsers });
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
            reservedBy: null,
          },
          distinct: true,
          col: "id",
        })
        .then((count) => resolve(count))
        .catch((err) => reject(err));
    });
    const allPosts = await new Promise((resolve, reject) => {
      post
        .count({
          where: {
            reservedBy: null,
          },
          distinct: true,
          col: "id",
        })
        .then((count) => resolve(count))
        .catch((err) => reject(err));
    });
    return res.status(200).json({ totalPosts, allPosts });
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
      u.username,
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
          attributes: ["id", "image", "userId", "rating"],
          order: [["rating", "DESC"]],
          include: [{ model: user, attributes: ["username"] }],
        })
        .then((record) => resolve(record))
        .catch((err) => reject(err));
    });
    let retrivedData = data.map((item) => ({
      ...item.get(),
      reviewer: item.user.username,
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
    const todayDorms = await new Promise((resolve, reject) => {
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

    const allDorms = await new Promise((resolve, reject) => {
      dormitoryPost
        .count({
          distinct: true,
          col: "id",
        })
        .then((count) => resolve(count))
        .catch((err) => reject(err));
    });

    return res.status(200).json({ todayDorms, allDorms });
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
/*exports.totalUsers = async (_, res) => {
  try {
    const data = await new Promise((resolve, reject) => {
      user
        .findAll({
          order: [["createdAt", "DESC"]],
          attributes: ["id", "username", "email", "phoneNum"],
          limit: 5,
          where: {
            role: process.env.STUDENT,
          },
          include: {
            model: student,
            attributes: ["blocked", "image", "id"],
          },
        })
        .then((record) => resolve(record))
        .catch((err) => reject(err));
    });
    const receivedData = data.map((item) => ({
      id: item.id,
      username: item.username,
      email: item.email,
      phoneNum: item.phoneNum,
      blocked: item.student.blocked,
      image: item.student.image,
      studemtId: item.student.id,
    }));
    return res.status(200).json(receivedData);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: "failed", message: "Internal Server Error" });
  }
};*/
