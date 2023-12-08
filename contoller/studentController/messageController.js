const { Op } = require("sequelize");
const { Sequelize } = require("../../models/index");
const sql = require("@sequelize/core");
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
  console.log("getMessage");
  const userId = req.params.userId;
  const senderId = await new Promise((resolve, reject) => {
    student.findOne({ where: { userId } }).then((record) => {
      if (record.id) resolve(record.id);
    });
  });
  console.log("senderId", senderId);
  const messages = await message
    .findAll({
      attributes: [
        "receiverId",
        "senderId",
        "text",
        "createdAt",
        //  [Sequelize.fn("MAX", Sequelize.col("createdAt")), "text"],
      ],
      where: {
        [Op.or]: [{ senderId }, { receiverId: senderId }],
      },
      order: [["createdAt", "DESC"]],
      group: ["receiverId"],
    })
    .catch((err) => {
      console.log("my error", err);
      return next(new AppError("An error occurred, please try again", 500));
    });
  console.log("messages", messages);
  let data = [];
  for (const message of messages) {
    /*   if (
      data.length > 0 &&
      message.receiverId === data[data.length - 1].receiverId
    )
      continue;*/
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
    });
  }
  res.status(200).json({ data });
});
