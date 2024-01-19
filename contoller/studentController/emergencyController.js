const AppError = require("../../utils/appError");
const {
  dormitoryOwner,
  dormitoryPost,
  room,
  user,
  student,
  emergency,
} = require("../../models");
const catchAsync = require("../../utils/catchAsync");
const { Op } = require("sequelize");
exports.createEmergency = async (req, res) => {
  try {
    const { roomId, userId } = req.params;
    const data = req.body;
    const studentId = await new Promise((resolve, reject) => {
      student
        .findOne({ where: { userId, roomId }, attributes: ["id"] })
        .then((record) => {
          resolve(record.id);
        })
        .catch((err) => {
          reject(err);
        });
    });
    if (!studentId)
      return res.status(404).json({
        status: "failed",
        message: "not found",
      });
    await emergency
      .create({ ...data, studentId, roomId })
      .then((record) => {
        return res.status(200).json({
          status: "success",
          message: "created successfully",
        });
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    console.log("The error", err);
    return res.status(500).json({
      status: "failed",
      message: "Internal Server Error",
    });
  }
};
exports.getMyRoom = async (req, res) => {
  try {
    const { userId } = req.params;

    const data = await new Promise((resolve, reject) => {
      student
        .findOne({
          where: { userId },
          attributes: ["id", "roomId"],
          include: [
            {
              model: room,
              attributes: [
                "type",
                "rent",
                "numberOfPerson",
                "avilableSeat",
                "id",
                "image",
              ],
              include: [
                {
                  model: dormitoryPost,
                  attributes: [
                    "id",
                    "numberOfRoom",
                    "services",
                    "lon",
                    "lat",
                    "distance",
                    "gender",
                    "image",
                  ],
                },
              ],
            },
          ],
        })
        .then((record) => {
          resolve(record);
        })
        .catch((err) => {
          reject(err);
        });
    });
    const retriveData = {
      ...data.get(),
      dormitoryPostId: data.room.dormitoryPost.id,
      numberOfRoom: data.room.dormitoryPost.numberOfRoom,
      services: data.room.dormitoryPost.services,
      lon: data.room.dormitoryPost.lon,
      lat: data.room.dormitoryPost.lat,
      distance: data.room.dormitoryPost.distance,
      gender: data.room.dormitoryPost.gender,
      image: data.room.dormitoryPost.image,
      roomImage: data.room.image,
      room: undefined,
    };
    return res.status(200).json(retriveData);
  } catch (err) {
    console.log("The error", err);
    return res.status(500).json({
      status: "failed",
      message: "Internal Server Error",
    });
  }
};
