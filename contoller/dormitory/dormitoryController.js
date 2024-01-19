const AppError = require("../../utils/appError");
const {
  dormitoryOwner,
  dormitoryPost,
  user,
  room,
  images,
  student,
} = require("../../models");
const { addDocument } = require("../handelFactrory");
const catchAsync = require("../../utils/catchAsync");
const Sequelize = require("sequelize");
const { Op } = require("sequelize");
const { UploadFile, getURL, deleteFile } = require("../../firebaseConfig");

exports.addDormitoryPost = async (req, res) => {
  const data = JSON.parse(req.body.data);
  const files = req.files;
  const userId = req.params.userId;
  try {
    const dormitoryOwnerId = await new Promise((resolve, reject) => {
      dormitoryOwner
        .findOne({
          attributes: ["id"],
          where: { userId },
        })
        .then((record) => {
          resolve(record.id);
        })
        .catch((err) => reject(err));
    });

    console.log("dormitoryOwnerId", dormitoryOwnerId);
    const post = {
      numberOfRoom: data.numberOfRoom,
      services: data.services,
      lon: data.lon,
      lat: data.lat,
      distance: data.distance,
      gender: data.gender,
      dormitoryOwnerId,
    };
    console.log("post", post);
    const dormitoryPostId = await new Promise((resolve, reject) => {
      dormitoryPost.create(post).then((record) => {
        if (record) resolve(record.id);
        else
          return res
            .status(400)
            .json({ status: "failed", message: "please try again" });
      });
    });
    const nameImage = `/dormitoryposts/${dormitoryPostId}_0`;
    await UploadFile(files[0].buffer, nameImage);
    const image = await getURL(nameImage);
    console.log(image);
    await dormitoryPost.update({ image }, { where: { id: dormitoryPostId } });
    let URLS = [];
    for (let i = 1; i < files.length; i++) {
      const nameImage = `/dormitoryposts/${dormitoryPostId}_${i}`;
      await UploadFile(files[i].buffer, nameImage);
      const image = await getURL(nameImage);
      console.log("image:", image);
      URLS.push(image);
    }

    console.log("URLS=", URLS[1]);
    let { rooms } = data;
    console.log("rooms", rooms);
    rooms = data.rooms.map((room, i) => ({
      ...room,
      dormitoryPostId,
      image: URLS[i],
    }));

    await room.bulkCreate(rooms).then((record) => {
      console.log(record);
      return res
        .status(201)
        .json({ status: "success", message: "created Successfuly" });
    });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError")
      return result.status(409).json({
        status: "failed",
        message: "This room is already created",
      });
    if (err.name === "SequelizeValidationError")
      return result.status(400).json({
        status: "failed",
        message: "Bad request",
      });
    console.log("The error", err);
    return res.status(500).json({
      status: "failed",
      message: "Internal Server Error",
    });
  }
};
exports.deleteDormitoryPost = catchAsync(async (req, res, next) => {
  try {
    const id = req.params.dorimtoryPostid;
    const userId = req.params.userId;
    const dormitoryOwnerId = await new Promise((resolve) => {
      dormitoryOwner
        .findOne({ where: { userId }, attributes: ["id"] })
        .then((record) => {
          if (record) resolve(record.id);
        });
    });
    /* let numberOfRoom = 0;
    await room.findAll({ where: { dormitoryPostId: id } }).then((record) => {
      numberOfRoom = record.length;
    });*/
    const numberOfImages = new Promise((resolve, reject) => {
      images.destroy({ where: { dormitoryPostId: id } }).then((deleteCount) => {
        resolve(deleteCount);
      });
    });
    if (numberOfImages === 0)
      return res.status(404).json({
        status: "failed",
        message: "this post not found",
      });
    for (let i = 1; i <= numberOfImages; i++) {
      const nameImage = `/dormitoryposts/${id}_${i}`;
      await deleteFile(nameImage);
    }
    await room.destroy({ where: { dormitoryPostId: id } }).then((count) => {
      console.log(count);
      if (count >= 1) {
        dormitoryPost.destroy({ where: { id } }).then((count) => {
          if (count === 1) return res.status(204).json({});
          else if (count === 0)
            return res
              .status(404)
              .json({ status: "failed", message: "this post not found" });
        });
      }
      if (count === 0)
        res
          .status(404)
          .json({ status: "failed", message: "this post not found" });
    });
  } catch (err) {
    console.log("My error:", err);
    return next(new AppError("An error occurred please try again", 500));
  }
});
exports.assignUser = async (req, res) => {
  try {
    const { phoneNum } = req.body;
    const { roomId } = req.params;
    const studentId = await new Promise((resolve, reject) => {
      user
        .findOne({
          where: { phoneNum },
          attributes: [],
          include: [
            {
              model: student,
              attributes: ["id"],
            },
          ],
        })
        .then((record) => {
          resolve(record.student.id);
        })
        .catch((err) => {
          reject(err);
        });
    });
    console.log(studentId);
    const count = await new Promise((resolve, reject) => {
      student
        .update(
          { roomId },
          {
            where: {
              id: studentId,
            },
          }
        )
        .then(([count]) => {
          resolve(count);
        })
        .catch((err) => {
          reject(err);
        });
    });
    if (count === 1) {
      room
        .update(
          { avilableSeat: Sequelize.literal("avilableSeat-1") },
          { where: { id: roomId } }
        )
        .then(([count]) => {
          if (count === 1)
            return res.status(200).json({
              status: "success",
              message: "updated successfully",
            });
        })
        .catch((err) => {
          throw err;
        });
    } else
      return res.status(200).json({
        status: "success",
        message: "you are assign this user",
      });
  } catch (err) {
    console.log("The error", err);
    return res.status(500).json({
      status: "failed",
      message: "Internal Server Error",
    });
  }
};
