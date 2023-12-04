const { Op, where } = require("sequelize");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const { UploadFile, getURL } = require("../../firebaseConfig");
const { intersection } = require("../../utils/arrayActions");
const { student, user, message } = require("../../models");
exports.sendMessage = catchAsync(async (req, res, next) => {
  const receiverId = req.params.receiverId;
  const senderId = req.params.senderId;
  const { text } = req.body;
  /*const senderId = await new Promise((resolve, reject) => {
    student.findOne({ where: { userId } }).then((record) => {
      if (record.id) resolve(record.id);
    });
  });*/
  const data = {
    text,
    receiverId,
    senderId,
  };
  await message.create({ data }).then(() => {
    return res.status(201).json({
      message: "sent successfully",
    });
  });
});
exports.getMessage = catchAsync(async (req, res, next) => {
  const receiverId = req.params.receiverId;
  const senderId = req.params.senderId;
  /* const senderId = await new Promise((resolve, reject) => {
    student.findOne({ where: { userId } }).then((record) => {
      if (record.id) resolve(record.id);
    });
  });*/
  const messages = await message.findAll({
    where: {
      [Op.or]: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
      order: [["createdAt", "DESC"]],
    },
  });
  let data = messages.map((message) => message.text);
  res.status(200).json({ data });
});
