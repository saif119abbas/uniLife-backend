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
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setDate(lastMonth.getDate() - 30);

    const retrievedData = await dormitoryOwner
      .findOne({
        where: { userId },
        attributes: [
          [
            Sequelize.literal(`(
            SELECT COUNT(DISTINCT dormitoryViews.id)
            FROM dormitoryPosts
            LEFT JOIN dormitoryViews ON dormitoryPosts.id = dormitoryViews.dormitoryPostId
            WHERE dormitoryOwner.id = dormitoryPosts.dormitoryOwnerId
            AND dormitoryViews.createdAt BETWEEN :yesterday AND :today
          )`),
            "viewsLastDay",
          ],
          [
            Sequelize.literal(`(
            SELECT COUNT(DISTINCT savedDormitories.id)
            FROM dormitoryPosts
            LEFT JOIN savedDormitories ON dormitoryPosts.id = savedDormitories.dormitoryPostId
            WHERE dormitoryOwner.id = dormitoryPosts.dormitoryOwnerId
            AND savedDormitories.createdAt BETWEEN :yesterday AND :today
          )`),
            "savedLastDay",
          ],
          [
            Sequelize.literal(`(
            SELECT COUNT(DISTINCT dormitoryViews.id)
            FROM dormitoryPosts
            LEFT JOIN dormitoryViews ON dormitoryPosts.id = dormitoryViews.dormitoryPostId
            WHERE dormitoryOwner.id = dormitoryPosts.dormitoryOwnerId
            AND dormitoryViews.createdAt BETWEEN :lastWeek AND :today
          )`),
            "viewsLastWeek",
          ],
          [
            Sequelize.literal(`(
            SELECT COUNT(DISTINCT savedDormitories.id)
            FROM dormitoryPosts
            LEFT JOIN savedDormitories ON dormitoryPosts.id = savedDormitories.dormitoryPostId
            WHERE dormitoryOwner.id = dormitoryPosts.dormitoryOwnerId
            AND savedDormitories.createdAt BETWEEN :lastWeek AND :today
          )`),
            "savedLastWeek",
          ],
          [
            Sequelize.literal(`(
            SELECT COUNT(DISTINCT dormitoryViews.id)
            FROM dormitoryPosts
            LEFT JOIN dormitoryViews ON dormitoryPosts.id = dormitoryViews.dormitoryPostId
            WHERE dormitoryOwner.id = dormitoryPosts.dormitoryOwnerId
            AND dormitoryViews.createdAt BETWEEN :lastMonth AND :today
          )`),
            "viewsLastMonth",
          ],
          [
            Sequelize.literal(`(
            SELECT COUNT(DISTINCT savedDormitories.id)
            FROM dormitoryPosts
            LEFT JOIN savedDormitories ON dormitoryPosts.id = savedDormitories.dormitoryPostId
            WHERE dormitoryOwner.id = dormitoryPosts.dormitoryOwnerId
            AND savedDormitories.createdAt BETWEEN :lastMonth AND :today
          )`),
            "savedLastMonth",
          ],
        ],
        replacements: {
          yesterday,
          today,
          lastWeek,
          lastMonth,
        },
        raw: true,
      })
      .catch((error) => {
        throw error;
      });
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
