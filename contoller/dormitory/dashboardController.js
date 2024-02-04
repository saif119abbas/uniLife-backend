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
    const dormitoryOwnerId = await new Promise((resolve, reject) => {
      dormitoryOwner
        .findOne({ where: { userId }, attributes: ["id"] })
        .then((record) => {
          resolve(record.id);
        })
        .catch((err) => {
          reject(err);
        });
    });
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const { viewsLastDay, savedLastDay } = await new Promise(
      (resolve, reject) => {
        dormitoryPost
          .findAll({
            attributes: ["id", "name"],
            include: [
              {
                model: dormitoryView,
                attributes: [
                  "id",
                  [
                    Sequelize.fn(
                      "COUNT",
                      Sequelize.col("dormitoryViews.dormitoryPostId")
                    ),
                    "viewCount",
                  ],
                ],
                where: {
                  createdAt: {
                    [Op.gte]: yesterday,
                    [Op.lte]: today,
                  },
                },
              },
              // {
              //   model: savedDormitory,
              //   attributes: [
              //     "id",
              //     [
              //       Sequelize.fn(
              //         "COUNT",
              //         Sequelize.col("savedDormitories.dormitoryPostId")
              //       ),
              //       "savedCount",
              //     ],
              //   ],
              //   where: {
              //     createdAt: {
              //       [Op.gte]: yesterday,
              //       [Op.lte]: today,
              //     },
              //   },
              // },
              {
                model: dormitoryOwner,
                where: { userId },
                attributes: [],
              },
            ],
            group: ["dormitoryPost.id"],
            order: [
              [
                Sequelize.literal("COUNT(`dormitoryViews`.`dormitoryPostId`)"),
                "DESC",
              ],
              // [
              //   Sequelize.literal(
              //     "COUNT(`savedDormitories`.`dormitoryPostId`)"
              //   ),
              //   "DESC",
              // ],
            ],
          })
          .then((record) => {
            console.log(record);
            const viewCount = record.dormitoryViews[0].viewCount;
            const savedCount = record.savedDormitories.savedCount;

            const data = {
              viewsLastDay: viewCount,
              savedLastDay: savedCount,
            };
            resolve(data);
          })
          .catch((err) => {
            reject(err);
          });
      }
    );
    // const lastWeek = new Date(today);
    // lastWeek.setDate(lastWeek.getDate() - 7);
    // const { viewsLastWeek, savedLastWeek } = await new Promise(
    //   (resolve, reject) => {
    //     dormitoryPost
    //       .findAll({
    //         attributes: [
    //           "id",
    //           "name",
    //           [
    //             Sequelize.fn("COUNT", Sequelize.col("views.dormitoryPostId")),
    //             "viewCount",
    //           ],
    //           [
    //             Sequelize.fn(
    //               "COUNT",
    //               Sequelize.col("savedDormitories.dormitoryPostId")
    //             ),
    //             "savedCount",
    //           ],
    //         ],
    //         include: [
    //           {
    //             model: dormitoryView,
    //             attributes: ["id"],
    //             where: {
    //               createdAt: {
    //                 [Op.gt]: lastWeek,
    //                 [Op.lte]: today,
    //               },
    //             },
    //           },
    //           {
    //             model: savedDormitory,
    //             attributes: ["id"],
    //             where: {
    //               createdAt: {
    //                 [Op.gt]: lastWeek,
    //                 [Op.lte]: today,
    //               },
    //             },
    //           },
    //           {
    //             model: dormitoryOwner,
    //             where: { userId },
    //             attributes: [],
    //           },
    //         ],
    //         group: ["dormitoryPost.id"],
    //         order: [
    //           [Sequelize.literal("viewCount"), "DESC"],
    //           [Sequelize.literal("savedCount"), "DESC"],
    //         ],
    //       })
    //       .then((record) => {
    //         const { viewCount, savedCount } = record;
    //         const data = {
    //           viewsLastWeek: viewCount,
    //           savedLastWeek: savedCount,
    //         };
    //         resolve(data);
    //       })
    //       .catch((err) => {
    //         reject(err);
    //       });
    //   }
    // );
    // const lastMonth = new Date(today);
    // lastMonth.setDate(lastWeek.getDate() - 30);
    // const { viewsLastMonth, savedLastMonth } = await new Promise(
    //   (resolve, reject) => {
    //     dormitoryPost
    //       .findAll({
    //         attributes: [
    //           "id",
    //           "name",
    //           [
    //             Sequelize.fn("COUNT", Sequelize.col("views.dormitoryPostId")),
    //             "viewCount",
    //           ],
    //           [
    //             Sequelize.fn(
    //               "COUNT",
    //               Sequelize.col("savedDormitories.dormitoryPostId")
    //             ),
    //             "savedCount",
    //           ],
    //         ],
    //         include: [
    //           {
    //             model: dormitoryView,
    //             attributes: ["id"],
    //             where: {
    //               createdAt: {
    //                 [Op.gt]: lastMonth,
    //                 [Op.lte]: today,
    //               },
    //             },
    //           },
    //           {
    //             model: savedDormitory,
    //             attributes: ["id"],
    //             where: {
    //               createdAt: {
    //                 [Op.gt]: lastMonth,
    //                 [Op.lte]: today,
    //               },
    //             },
    //           },
    //           {
    //             model: dormitoryOwner,
    //             where: { userId },
    //             attributes: [],
    //           },
    //         ],
    //         group: ["dormitoryPost.id"],
    //         order: [
    //           [Sequelize.literal("viewCount"), "DESC"],
    //           [Sequelize.literal("savedCount"), "DESC"],
    //         ],
    //       })
    //       .then((record) => {
    //         const { viewCount, savedCount } = record;
    //         const data = {
    //           viewsLastMonth: viewCount,
    //           savedLastMonth: savedCount,
    //         };
    //         resolve(data);
    //       })
    //       .catch((err) => {
    //         reject(err);
    //       });
    //   }
    // );
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
    return res
      .status(500)
      .json({ status: "failed", message: "Internal Server Error" });
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
