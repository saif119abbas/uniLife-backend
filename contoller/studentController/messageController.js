const { Op } = require("sequelize");
//const { Sequelize } = require("../../models/index");
const sql = require("@sequelize/core");
const Sequelize = require("sequelize");
const { QueryTypes } = require("sequelize");
const catchAsync = require("../../utils/catchAsync");
const { student, user, message, sequelize } = require("../../models");
const { UploadFile, getURL, deleteFile } = require("../../firebaseConfig");
const AppError = require("../../utils/appError");
exports.sendMessage = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  const receiverId = req.params.receiverId;
  const senderId = await new Promise((resolve, reject) => {
    student.findOne({ where: { userId } }).then((record) => {
      if (record.id) resolve(record.id);
    });
  });
  const { text } = JSON.parse(req.body.data);
  console.log(req.body.text);
  /*const file = req.file;
  const image = file.buffer;*/
  const data = {
    receiverId,
    senderId,
    text,
    // image,
  };
  await new Promise((resolve, reject) => {
    message
      .create(data)
      .then((record) => {
        return res.status(201).json({
          message: "sent successfully",
        });
      })
      .catch((err) => {
        console.log("my error", err);
        return next(new AppError("An error occurred please try again", 500));
      });
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
  console.log("sequelize", sequelize);
  const messages = await message
    .findAll({
      attributes: [
        "id",
        "text",
        "createdAt",
        // [sequelize.col("s.id", "senderId")],
      ],
      where: {
        [Op.or]: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
      order: [["createdAt", "DESC"]],
      /*include: [
        {
          model: student,
          attributes: ["id"],
          // as: "s",
          /*where: {
            [Op.literal]: `('s'.'id' = 'message'.'senderId' and 'message'.'receiverId' =${receiverId} )or('message'.'senderId' = ${receiverId}  and 'message'.'receiverId' ='s'.'id')`,
          },
          include: [
            {
              model: user,
              attributes: ["username"],
              //as: "u",
              where: { userId },
            },
          ],
        },
      ],*/
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
      senderId,
      receiverId,
      createdAt: message.createdAt,
    });
  }
  console.log("message: ", messages);
  return res.status(200).json({ data });
});
exports.getMyMessage = catchAsync(async (req, res, next) => {
  try {
    const Sequelize = require("sequelize");
    const sequelize = new Sequelize("uniLife2", "root", "", {
      host: "localhost",
      dialect: "mysql",
    });
    const userId = req.params.userId;
    const messages = await sequelize.query(
      `SELECT m.id,m.text,m.createdAt,lastMessages.otherPersonId as recieverId, r.image AS image, u.username AS username
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
      LEFT JOIN users u2 ON u2.id=${userId}
      LEFT JOIN students s ON s.userId= u2.id
      LEFT JOIN students r ON lastMessages.otherPersonId  = r.id
      LEFT JOIN users u ON r.userId= u.id
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
