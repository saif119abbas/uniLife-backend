const { Op, where } = require("sequelize");
const catchAsync = require("../../utils/catchAsync");
const { student, user, message } = require("../../models");
const AppError = require("../../utils/appError");
exports.sendMessage = catchAsync(async (req, res, next) => {
  const receiverId = req.params.receiverId;
  //const senderId = req.params.senderId;
  const userId = req.params.userId;
  const { text } = req.body;
  const senderId = await new Promise((resolve, reject) => {
    student.findOne({ where: { userId } }).then((record) => {
      console.log("record", record);
      if (record.id) resolve(record.id);
    });
  });
  console.log("senderId:", senderId);
  console.log("Here");
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
  const receiverId = req.params.receiverId;
  const userId = req.params.userId;
  const senderId = await new Promise((resolve, reject) => {
    student.findOne({ where: { userId } }).then((record) => {
      if (record.id) resolve(record.id);
    });
  });
  console.log("senderId", senderId);
  const messages = await message
    .findAll({
      attributes: ["id", "text", "senderId", "receiverId"],
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
  const data = messages.map((message) => message.text);
  res.status(200).json({ data });
});
