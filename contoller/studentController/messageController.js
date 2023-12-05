const { Op, where } = require("sequelize");
const catchAsync = require("../../utils/catchAsync");
const { student, user, message } = require("../../models");
const AppError = require("../../utils/appError");
const { resolve } = require("path");
const { rejects } = require("assert");
exports.sendMessage = catchAsync(async (req, res, next) => {
  console.log("params:", req.params);
  const userId1 = req.params.userId;
  const userId2 = req.params.userIdReceiver;
  const senderId = await new Promise((resolve, reject) => {
    student.findOne({ where: { userId: userId1 } }).then((record) => {
      if (record.id) resolve(record.id);
    });
  });
  const receiverId = await new Promise((resolve, reject) => {
    student.findOne({ where: { userId: userId2 } }).then((record) => {
      if (record.id) resolve(record.id);
    });
  });
  console.log("senderId:", senderId);
  console.log("Here");
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
  const userId1 = req.params.userId;
  const userId2 = req.params.userIdReceiver;
  console.log(userId1, userId2);
  const senderId = await new Promise((resolve, reject) => {
    student.findOne({ where: { userId: userId1 } }).then((record) => {
      if (record.id) resolve(record.id);
    });
  });
  const receiverId = await new Promise((resolve, reject) => {
    student.findOne({ where: { userId: userId2 } }).then((record) => {
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
  //const receiverId = req.params.receiverId;
  const userId = req.params.userId;
  const senderId = await new Promise((resolve, reject) => {
    student.findOne({ where: { userId } }).then((record) => {
      if (record.id) resolve(record.id);
    });
  });
  console.log("senderId", senderId);
  const messages = await message
    .findAll({
      attributes: ["receiverId"],
      where: {
        senderId,
      },
      order: [["createdAt", "DESC"]],
    })
    .catch((err) => {
      console.log("my error", err);
      return next(new AppError("An error occurred, please try again", 500));
    });
  let data = [];
  for (const message of messages) {
    const id = message.receiverId;
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
    const username = await new Promise((resolve, reject) => {
      user
        .findOne({ attributes: ["username"], where: { id: myStudent.userId } })
        .then((record) => {
          if (record.username) resolve(record.username);
          else
            return res.status(404).json({
              message: "not found messages",
            });
        });
    });
    data.push({ username, image: myStudent.image, receiverId: id });
  }
  res.status(200).json({ data });
});
