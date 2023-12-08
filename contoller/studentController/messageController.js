const { Op } = require("sequelize");
//const { Sequelize } = require("../../models/index");
const sql = require("@sequelize/core");
const Sequelize = require("sequelize");
const { QueryTypes } = require("sequelize");
const catchAsync = require("../../utils/catchAsync");
const { student, user, message } = require("../../models");
const AppError = require("../../utils/appError");
exports.sendMessage = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  const receiverId = req.params.receiverId;
  const senderId = await new Promise((resolve, reject) => {
    student.findOne({ where: { userId } }).then((record) => {
      if (record.id) resolve(record.id);
    });
  });
  const { text } = req.body;
  const data = {
    text,
    receiverId,
    senderId,
  };
  await message
    .create(data)
    .then(() => {
      return res.status(201).json({
        message: "sent successfully",
      });
    })
    .catch((err) => {
      console.log("my error", err);
      return next(new AppError("An error occurred please try again", 500));
    });
});
exports.getMessage = catchAsync(async (req, res, next) => {
  console.log("getMessage");
  //const receiverId = req.params.receiverId;
  const userId = req.params.userId;
  const receiverId = req.params.receiverId;
  const senderId = await new Promise((resolve, reject) => {
    student.findOne({ where: { userId } }).then((record) => {
      if (record.id) resolve(record.id);
    });
  });

  console.log("senderId", senderId);
  const messages = await message
    .findAll({
      attributes: ["id", "text", "senderId", "receiverId", "createdAt"],
      where: {
        [Op.or]: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
      order: [["createdAt", "DESC"]],
    })
    .catch((err) => {
      console.log("my error", err);
      return next(new AppError("An error occurred, please try again", 500));
    });
  let data = [];
  for (const message of messages) {
    data.push({
      id: messages.id,
      text: message.text,
      senderId: message.senderId,
      receiverId: message.receiverId,
      createdAt: message.createdAt,
    });
  }
  res.status(200).json({ data });
});
exports.getMyMessage = catchAsync(async (req, res, next) => {
  const Sequelize = require("sequelize");
  const sequelize = new Sequelize("uniLife2", "root", "", {
    host: "localhost",
    dialect: "mysql",
  });
  const userId = req.params.userId;
  const senderId = await new Promise((resolve, reject) => {
    student.findOne({ where: { userId } }).then((record) => {
      if (record.id) resolve(record.id);
    });
  });
  console.log("senderId", senderId);
  const messages = await sequelize.query(
    `SELECT m.*
  FROM messages m
  JOIN (
      SELECT 
          MAX(createdAt) AS lastMessageTime,
          CASE
              WHEN senderId = ${senderId} THEN receiverId
              ELSE senderId
          END AS otherPersonId
      FROM messages
      WHERE senderId =  ${senderId} OR receiverId =  ${senderId}
      GROUP BY otherPersonId
  ) lastMessages ON (m.createdAt = lastMessages.lastMessageTime)
  WHERE (m.senderId = ${senderId} OR m.receiverId =  ${senderId})
  ORDER BY m.createdAt DESC;
  `,
    {
      type: QueryTypes.SELECT,
    }
  );
  console.log("messages", messages);
  let data = [];
  for (const message of messages) {
    let id = message.receiverId;
    if (id === senderId) id = message.senderId;

    const myStudent = await new Promise((resolve, reject) => {
      student
        .findOne({ attributes: ["userId", "image"], where: { id } })
        .then((record) => {
          if (!record)
            return res.status(404).json({
              message: "not found messages",
            });
          else resolve(record);
        });
    });
    const image = myStudent.image;
    username = await new Promise((resolve, reject) => {
      user
        .findOne({
          attributes: ["username"],
          where: { id: myStudent.userId },
        })
        .then((record) => {
          if (record.username) resolve(record.username);
          else
            return res.status(404).json({
              message: "not found messages",
            });
        });
    });

    data.push({
      username,
      image: image,
      receiverId: id,
      lastMessage: message.text,
      createdAt: message.createdAt,
    });
  }
  res.status(200).json({ data });
});
