const {
  dormitoryOwner,
  dormitoryPost,
  dormitoryView,
  savedDormitory,
  user,
} = require("../../models");
const Sequelize = require("sequelize");
const { Op, QueryTypes } = require("sequelize");
const sequelize = require("../../sequelize");

exports.getStatistics = async (req, res) => {
  try {
    const { userId } = req.params;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const { viewsLastDay, savedLastDay } = await new Promise(
      (resolve, reject) => {
        dormitoryOwner
          .findOne({
            where: { userId },
            attributes: ["id"],
            include: [
              {
                model: dormitoryPost,
                group: ["dormitoryPosts.id"],
                attributes: ["id"],
                include: [
                  {
                    model: dormitoryView,
                    attributes: [[Sequelize.fn("count", "id"), "viewsLastDay"]],
                    where: {
                      createdAt: {
                        [Op.gte]: yesterday,
                        [Op.lte]: today,
                      },
                    },
                    required: false,
                  },
                  {
                    model: savedDormitory,
                    attributes: [[Sequelize.fn("count", "id"), "savedLastDay"]],

                    where: {
                      createdAt: {
                        [Op.gte]: yesterday,
                        [Op.lte]: today,
                      },
                    },
                    required: false,
                  },
                ],
              },
            ],
            // group: ["dormitoryOwner.id"],
          })
          .then((record) => {
            const viewsLastDay =
              record.dormitoryPosts[0].dormitoryViews.length > 0
                ? // resolve({ viewsLastDay, savedLastDay });
                  record.dormitoryPosts[0].dormitoryViews[0].dataValues
                    .viewsLastDay
                : 0;
            const savedLastDay = record.dormitoryPosts[0].savedDormitories
              .length
              ? record.dormitoryPosts[0].savedDormitories[0].dataValues
                  .savedLastDay
              : 0;
            resolve({ viewsLastDay, savedLastDay });
            //resolve(record);
          })
          .catch((err) => {
            reject(err);
          });
      }
    );
    const lastWek = new Date(today);
    lastWek.setDate(yesterday.getDate() - 7);
    const { viewsLastWeek, savedLastWeek } = await new Promise(
      (resolve, reject) => {
        dormitoryOwner
          .findOne({
            where: { userId },
            attributes: ["id"],
            include: [
              {
                model: dormitoryPost,
                group: ["dormitoryPosts.id"],
                attributes: ["id"],
                include: [
                  {
                    model: dormitoryView,
                    attributes: [
                      [Sequelize.fn("count", "id"), "viewsLastWeek"],
                    ],
                    where: {
                      createdAt: {
                        [Op.gte]: lastWek,
                        [Op.lte]: today,
                      },
                    },
                    required: false,
                  },
                  {
                    model: savedDormitory,
                    attributes: [
                      [Sequelize.fn("count", "id"), "savedLastWeek"],
                    ],

                    where: {
                      createdAt: {
                        [Op.gte]: lastWek,
                        [Op.lte]: today,
                      },
                    },
                    required: false,
                  },
                ],
              },
            ],
            // group: ["dormitoryOwner.id"],
          })
          .then((record) => {
            const viewsLastWeek =
              record.dormitoryPosts[0].dormitoryViews.length > 0
                ? // resolve({ viewsLastDay, savedLastDay });
                  record.dormitoryPosts[0].dormitoryViews[0].dataValues
                    .viewsLastWeek
                : 0;
            const savedLastWeek = record.dormitoryPosts[0].savedDormitories
              .length
              ? record.dormitoryPosts[0].savedDormitories[0].dataValues
                  .savedLastWeek
              : 0;
            resolve({ viewsLastWeek, savedLastWeek });
            //resolve(record);
          })
          .catch((err) => {
            reject(err);
          });
      }
    );
    const lastMonth = new Date(today);
    lastMonth.setDate(yesterday.getDate() - 7);
    const { viewsLastMonth, savedLastMonth } = await new Promise(
      (resolve, reject) => {
        dormitoryOwner
          .findOne({
            where: { userId },
            attributes: ["id"],
            include: [
              {
                model: dormitoryPost,
                group: ["dormitoryPosts.id"],
                attributes: ["id"],
                include: [
                  {
                    model: dormitoryView,
                    attributes: [
                      [Sequelize.fn("count", "id"), "viewsLastMonth"],
                    ],
                    where: {
                      createdAt: {
                        [Op.gte]: lastMonth,
                        [Op.lte]: today,
                      },
                    },
                    required: false,
                  },
                  {
                    model: savedDormitory,
                    attributes: [
                      [Sequelize.fn("count", "id"), "savedLastMonth"],
                    ],

                    where: {
                      createdAt: {
                        [Op.gte]: lastMonth,
                        [Op.lte]: today,
                      },
                    },
                    required: false,
                  },
                ],
              },
            ],
            // group: ["dormitoryOwner.id"],
          })
          .then((record) => {
            const viewsLastMonth =
              record.dormitoryPosts[0].dormitoryViews.length > 0
                ? // resolve({ viewsLastDay, savedLastDay });
                  record.dormitoryPosts[0].dormitoryViews[0].dataValues
                    .viewsLastMonth
                : 0;
            const savedLastMonth = record.dormitoryPosts[0].savedDormitories
              .length
              ? record.dormitoryPosts[0].savedDormitories[0].dataValues
                  .savedLastMonth
              : 0;
            resolve({ viewsLastMonth, savedLastMonth });
            //resolve(record);
          })
          .catch((err) => {
            reject(err);
          });
      }
    );

    const retrievedData = {
      viewsLastDay,
      savedLastDay,
      viewsLastWeek,
      savedLastWeek,
      viewsLastMonth,
      savedLastMonth,
    };

    return res.status(200).json(retrievedData);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "failed",
      message: "Internal Server Error",
    });
  }
};

exports.topPosts = async (req, res) => {
  try {
    const userId = req.params.userId;
    const upper = new Date();
    const lower = new Date();
    lower.setDate(lower.getDate() - 30);
    const data = await sequelize.query(
      `SELECT
      dormitoryPost.name,
        COUNT(savedDormitory.dormitoryPostId) AS savedCount
        FROM
        dormitoryPosts AS dormitoryPost
        LEFT JOIN savedDormitories AS savedDormitory  ON savedDormitory.dormitoryPostId = dormitoryPost.id
        LEFT JOIN dormitoryOwners AS dormitoryOwner  ON dormitoryOwner.id = dormitoryPost.dormitoryOwnerId
        WHERE
        savedDormitory.createdAt BETWEEN :lower AND :upper
        AND dormitoryOwner.userId = :userId
        
        GROUP BY
        dormitoryPost.name
        ORDER BY
        savedCount DESC
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

    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: "fail", message: "Internal server error" });
  }
};
