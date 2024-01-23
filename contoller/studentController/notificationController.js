const AppError = require("../../utils/appError");
const { Op } = require("sequelize");
const Sequelize = require("sequelize");
const { notification, student } = require("../../models");
exports.getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const data = await new Promise((resolve, reject) => {
      student
        .findOne({
          where: { userId },
          attributes: [],
          order: [[{ model: notification }, "createdAt", "DESC"]],

          include: {
            model: notification,
            attributes: [
              "id",
              "text",
              "type",
              "image",
              "seen",
              [
                Sequelize.literal(
                  'DATE_FORMAT(`notifications`.`createdAt`, "%m/%d/%Y")'
                ),
                "orderAt",
              ],
            ],
          },
        })
        .then((record) => {
          resolve(record);
        })
        .catch((err) => {
          reject(err);
        });
    });
    const { notifications } = data;
    res.status(200).json(notifications);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: "failed", messgae: "Internal Server Error" });
  }
};
exports.getUnseenCount = async (req, res) => {
  try {
    const { userId } = req.params;
    const data = await new Promise((resolve, reject) => {
      student
        .findOne({
          where: { userId },
          attributes: [],
          include: {
            model: notification,
            attributes: [
              [
                Sequelize.fn("COUNT", Sequelize.col("notifications.id")),
                "count",
              ],
            ],
            where: { seen: 0 },
            required: false,
          },
        })
        .then((record) => {
          resolve(record);
        })
        .catch((err) => {
          reject(err);
        });
    });
    const {
      notifications: [count],
    } = data;
    res.status(200).json(count);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: "failed", messgae: "Internal Server Error" });
  }
};
