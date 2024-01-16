const { Op } = require("sequelize");
//const { Sequelize } = require("../../models/index");
const sql = require("@sequelize/core");
const Sequelize = require("sequelize");
const { QueryTypes } = require("sequelize");
const catchAsync = require("../../utils/catchAsync");
const { student, user, message, sequelize } = require("../../models");
const { UploadFile, getURL, deleteFile } = require("../../firebaseConfig");
const AppError = require("../../utils/appError");
const databaseName = require("../../databaseName");
exports.sendMessage = catchAsync(async (req, res, next) => {
  try {
    const { userId } = req.params;
    let { receiverId } = req.params;
    const senderId = await new Promise((resolve, reject) => {
      student.findOne({ where: { userId } }).then((record) => {
        if (record.id) resolve(record.id);
      });
    });
    receiverId = await new Promise((resolve, reject) => {
      student.findOne({ where: { userId: receiverId } }).then((record) => {
        if (record.id) resolve(record.id);
      });
    });
    let text = "";
    if (req.body.data) {
      const data = JSON.parse(req.body.data);
      text = data.text;
    }
    console.log(req.body.text);
    const file = req.file;
    const data = {
      receiverId,
      senderId,
      text,
      // image,
    };
    let status = false;
    const id = await new Promise((resolve, reject) => {
      message.create(data).then((record) => {
        resolve(record.id);
        status = true;
      });
    });
    const nameImage = `/messages/${id}`;
    const metadata = {
      contentType: "image/jpeg",
    };

    if (file) {
      await UploadFile(file.buffer, nameImage, metadata);
      const image = await getURL(nameImage);
      await message.update({ image }, { where: { id } }).then((count) => {
        if (count[0] === 1) status = true;
      });
    }
    if (status)
      return res.status(201).json({
        status: "success",
        message: "sent successfully",
      });
  } catch (err) {
    console.log("my error", err);
    return next(new AppError("An error occurred please try again", 500));
  }
});
exports.getMessage = catchAsync(async (req, res, next) => {
  console.log("getMessage");
  //const receiverId = req.params.receiverId;
  const { userId } = req.params;
  let userReceiverId = req.params.receiverId;
  const senderId = await new Promise((resolve, reject) => {
    student.findOne({ where: { userId } }).then((record) => {
      if (record.id) resolve(record.id);
    });
  });
  const receiverId = await new Promise((resolve, reject) => {
    student
      .findOne({ where: { userId: userReceiverId }, attributes: ["id"] })
      .then((record) => {
        if (record.id) resolve(record.id);
      });
  });
  let messages = await new Promise((resolve) => {
    message
      .findAll({
        attributes: [
          "id",
          "text",
          "createdAt",
          "image",
          "senderId",
          "receiverId",
          // [sequelize.col("s.id", "senderId")],
        ],
        where: {
          [Op.or]: [
            { senderId, receiverId },
            { senderId: receiverId, receiverId: senderId },
          ],
        },

        order: [["createdAt", "DESC"]],
      })
      .then((record) => {
        // await message.update({ seen: true }, { where: { id: record.id } });
        resolve(record);
      })
      .catch((err) => {
        console.log("my error", err);
        return next(new AppError("An error occurred, please try again", 500));
      });
  });
  messages = messages.map(async (message) => {
    console.log(message);
    const receiverId = await new Promise((resolve) => {});
    return { ...message.dataValues, receiverId: userReceiverId };
  });
  // messages.receiverId = userReceiverId;

  return res.status(200).json({ data: messages });
});
exports.getMyMessage = catchAsync(async (req, res, next) => {
  try {
    const Sequelize = require("sequelize");
    const sequelize = new Sequelize(databaseName, "root", "", {
      host: "localhost",
      dialect: "mysql",
    });
    const userId = req.params.userId;
    const messages = await sequelize.query(
      `SELECT m.id, m.text, m.createdAt,
      r.image AS image, u.username AS username,
      COUNT(CASE WHEN m.seen = false THEN 1 END) AS unseenCount,
      u.id AS otherPersonId  
    FROM messages m
    JOIN (
      SELECT 
        MAX(m2.createdAt) AS lastMessageTime,
        CASE
          WHEN senderId = s.id THEN m2.receiverId
          WHEN receiverId = s.id THEN m2.senderId
        END AS otherPersonId
      FROM messages m2
      JOIN students s ON (m2.senderId = s.id OR m2.receiverId = s.id) AND s.userId = ${userId}
      WHERE m2.senderId = s.id OR m2.receiverId = s.id
      GROUP BY otherPersonId
    ) lastMessages ON (m.createdAt = lastMessages.lastMessageTime)
    LEFT JOIN users u2 ON u2.id = ${userId}
    LEFT JOIN students s ON s.userId = u2.id
    LEFT JOIN students r ON lastMessages.otherPersonId = r.id
    LEFT JOIN users u ON r.userId = u.id
    WHERE (m.senderId = s.id OR m.receiverId =  s.id)
    ORDER BY m.createdAt DESC;
      `,
      {
        type: QueryTypes.SELECT,
      }
    );
    res.status(200).json({ messages });
  } catch (err) {
    console.log("The err", err);
  }
});
