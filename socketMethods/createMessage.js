const { student, user, message, FCM } = require("../models");
const { UploadFile, getURL, deleteFile } = require("../firebaseConfig");
const { Op } = require("sequelize");
const { pushNotification } = require("../notification");

exports.sendMessage = async (userId, receiverId, text) => {
  try {
    const senderId = await new Promise((resolve, reject) => {
      student.findOne({ where: { userId } }).then((record) => {
        if (record.id) resolve(record.id);
      });
    });

    const data = {
      receiverId,
      senderId,
      text,
      // image,
    };
    let status = false;
    const id = await new Promise((resolve, reject) => {
      console.log("myData:", data);
      message.create(data).then((record) => {
        resolve(record.id);
        status = true;
      });
    });
    if (status) {
      console.log("in status");
      return "done";
    }
  } catch (err) {
    console.log("my error", err);
    return "not done";
    // return next(new AppError("An error occurred please try again", 500));
  }
};
exports.sendMessage = async (userId, userReceiverId, text) => {
  try {
    const { senderId, FCMSender, username } = await new Promise(
      (resolve, reject) => {
        student
          .findOne({
            where: { userId },
            include: [
              { model: FCM, attribute: ["token"] },
              { model: user, attributes: ["username"] },
            ],
          })
          .then((record) => {
            const data = {
              senderId: record.id,
              FCMSender: record.FCMs,
              username: record.user.username,
            };
            if (record) resolve(data);
          })
          .catch((err) => reject(err));
      }
    );
    const { receiverId, FCMReceiver } = await new Promise((resolve, reject) => {
      student
        .findOne({
          where: { userId: userReceiverId },
          include: [{ model: FCM, attribute: ["token"] }],
        })
        .then((record) => {
          const data = {
            receiverId: record.id,
            FCMReceiver: record.FCMs,
          };
          if (record) resolve(data);
        })
        .catch((err) => reject(err));
    });
    const data = {
      receiverId,
      senderId,
      text,
      // image,
    };
    let status = false;
    const id = await new Promise((resolve, reject) => {
      console.log("myData:", data);
      message.create(data).then((record) => {
        resolve(record.id);
        status = true;
      });
    });
    console.log("iddddd:", id);
    // const nameImage = /messages/${id};
    // const metadata = {
    //   contentType: "image/jpeg",
    // };

    // if (file) {
    //   await UploadFile(file.buffer, nameImage, metadata);
    //   const image = await getURL(nameImage);
    //   await message.update({ image }, { where: { id } }).then((count) => {
    //     if (count[0] === 1) status = true;
    //   });
    // }
    if (status) {
      FCMReceiver.map(async (item) => {
        const title = username;
        const body = text;
        await pushNotification(item.token, title, body);
      });
      console.log("in status");
      return "done";
    }
  } catch (err) {
    console.log("my error", err);
    return "not done";
    // return next(new AppError("An error occurred please try again", 500));
  }
};
exports.sendImage = async (userId, userReceiverId, file) => {
  try {
    const { senderId, FCMSender, username } = await new Promise(
      (resolve, reject) => {
        student
          .findOne({
            where: { userId },
            include: [
              { model: FCM, attribute: ["token"] },
              { model: user, attributes: ["username"] },
            ],
          })
          .then((record) => {
            const data = {
              senderId: record.id,
              FCMSender: record.FCMs,
              username: record.user.username,
            };
            if (record) resolve(data);
          })
          .catch((err) => reject(err));
      }
    );
    const { receiverId, FCMReceiver } = await new Promise((resolve, reject) => {
      student
        .findOne({
          where: { userId: userReceiverId },
          include: [{ model: FCM, attribute: ["token"] }],
        })
        .then((record) => {
          const data = {
            receiverId: record.id,
            FCMReceiver: record.FCMs,
          };
          if (record) resolve(data);
        })
        .catch((err) => reject(err));
    });
    const data = {
      receiverId,
      senderId,

      // image,
    };
    console.log("myImage=" + data.image);
    let status = false;
    const id = await new Promise((resolve, reject) => {
      console.log("myData:", data);
      message.create(data).then((record) => {
        resolve(record.id);
        status = true;
      });
    });
    if (status) {
      console.log("in status");
      const nameImage = `/messages/${id}`;
      const buf = Buffer.from(file, "base64");
      await UploadFile(buf, nameImage);
      const image = await getURL(nameImage);
      await message.update({ image }, { where: { id } });
      FCMReceiver.map(async (item) => {
        const title = username;
        const body = "sent a photo";
        await pushNotification(item.token, title, body);
      });
      /* res.status(201).json({
        status: "success",
        message: "Post created successfully",
        // Include any additional data you want to send back
      });*/
      return image;
    }
  } catch (err) {
    console.log("my error", err);
    return "not done";
  }
};
exports.seenMessage = async (senderId, receiverId) => {
  senderId = await new Promise((resolve, reject) => {
    student.findOne({ where: { userId: senderId } }).then((record) => {
      if (record.id) resolve(record.id);
    });
  });
  receiverId = await new Promise((resolve, reject) => {
    student
      .findOne({ where: { userId: receiverId }, attributes: ["id"] })
      .then((record) => {
        if (record.id) resolve(record.id);
      });
  });

  await message
    .update(
      { seen: true },
      {
        where: {
          [Op.or]: [
            { senderId, receiverId },
            { senderId: receiverId, receiverId: senderId },
          ],
        },
      }
    )
    .then(() => "done")
    .catch((err) => err.name);
};
