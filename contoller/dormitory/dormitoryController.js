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
  console.log(req.files);
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
      name: data.name,
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
    const { userId, dormitoryPostId } = req.params;

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

    /* for (let i = 1; i <= numberOfImages; i++) {
      const nameImage = `/dormitoryposts/${id}_${i}`;
      await deleteFile(nameImage);
    }*/
    await room
      .destroy({ where: { dormitoryPostId } })
      .then(async (roomCount) => {
        console.log(roomCount);

        for (let i = 0; i < roomCount; i++) {
          const nameImage = `/dormitoryposts/${dormitoryPostId}_${i}`;
          await deleteFile(nameImage);
        }
        await dormitoryPost
          .destroy({ where: { id: dormitoryPostId, dormitoryOwnerId } })
          .then((count) => {
            if (count === 1) {
              return res.status(204).json({});
            } else
              return res
                .status(404)
                .json({ status: "failed", message: "this post not found" });
          });
      });
  } catch (err) {
    console.log("My error:", err);
    return next(new AppError("An error occurred please try again", 500));
  }
});
exports.editDormitoryPost = catchAsync(async (req, res, next) => {
  try {
    const { userId, dormitoryPostId } = req.params;
    const data = JSON.parse(req.body.data);
    const file = req.file;
    const dormitoryOwnerId = await new Promise((resolve, reject) => {
      dormitoryOwner
        .findOne({ where: { userId }, attributes: ["id"] })
        .then((record) => {
          if (record) resolve(record.id);
        })
        .catch((err) => reject(err));
    });
    if (file) {
      const nameImage = `/dormitoryposts/${dormitoryPostId}_0`;
      await UploadFile(file.buffer, nameImage);
      const image = await getURL(nameImage);
      console.log(image);
      data.image = image;
    }
    await dormitoryPost
      .update(data, { where: { id: dormitoryPostId, dormitoryOwnerId } })
      .then(([count]) => {
        if (count === 1) {
          return res
            .status(200)
            .json({ status: "success", message: "Updated Successfully" });
        } else
          return res
            .status(404)
            .json({ status: "failed", message: "this post not found" });
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    console.log("My error:", err);
    return res
      .status(500)
      .json({ status: "failed", message: "Internal Server Error" });
  }
});
exports.editRoom = async (req, res) => {
  try {
    const { userId, dormitoryPostId, roomId } = req.params;
    const data = JSON.parse(req.body.data);

    const file = req.file;
    const dormitoryPosts = await new Promise((resolve, reject) => {
      dormitoryOwner
        .findOne({
          where: { userId },
          attributes: [],
          include: {
            model: dormitoryPost,
            where: { id: dormitoryPostId },
            attributes: ["id"],
          },
        })
        .then((record) => {
          if (record) resolve(record.dormitoryPosts);
        })
        .catch((err) => {
          reject(err);
        });
    });
    if (dormitoryPosts.length === 0 || !dormitoryPosts) {
      return res.status(403).json({ status: "failed", message: "not allowed" });
    }
    if (file) {
      const { URL } = data;

      const numberImage = URL
        ? URL.split("%2F")[1].split("?")[0]
        : `${dormitoryPostId}_1000`;
      const nameImage = `/dormitoryposts/${numberImage}`;
      await UploadFile(file.buffer, nameImage);
      const image = await getURL(nameImage);
      console.log(image);
      data.image = image;
    }
    data.URL = undefined;
    await room
      .update(data, { where: { id: roomId, dormitoryPostId } })
      .then(([count]) => {
        if (count === 1) {
          return res
            .status(200)
            .json({ status: "success", message: "Upddated Successfully" });
        } else
          return res
            .status(404)
            .json({ status: "failed", message: "this post not found" });
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    console.log("My error:", err);
    return res
      .status(500)
      .json({ status: "failed", message: "Internal Server Error" });
  }
};
exports.addRoom = async (req, res) => {
  try {
    const { userId, dormitoryPostId } = req.params;
    console.log(req.body.data);
    const data = JSON.parse(req.body.data);
    const file = req.file;
    const numberOfRoom = await new Promise((resolve, reject) => {
      dormitoryOwner
        .findOne({
          where: { userId },
          attributes: ["id"],
          include: {
            model: dormitoryPost,
            where: { id: dormitoryPostId },
            attributes: ["id", "numberOfRoom"],
          },
        })
        .then((record) => {
          if (record) resolve(record?.dormitoryPosts[0].numberOfRoom);
        })
        .catch((err) => reject(err));
    });
    if (!numberOfRoom) {
      return res.status(403).json({ status: "failed", message: "not allowed" });
    }

    const nameImage = `/dormitoryposts/${dormitoryPostId}_${numberOfRoom + 1}`;
    await UploadFile(file.buffer, nameImage);
    const image = await getURL(nameImage);
    console.log(image);
    data.image = image;
    await room.create({ ...data, dormitoryPostId }).then(async (record) => {
      await dormitoryPost.update(
        { numberOfRoom: numberOfRoom + 1 },
        { where: { id: dormitoryPostId } }
      );
      return res.status(201).json({
        status: "success",
        message: "added Successfully",
        id: record.id,
      });
    });
  } catch (err) {
    console.log("My error:", err);
    return res
      .status(500)
      .json({ status: "failed", message: "Internal Server Error" });
  }
};
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
exports.deleteRoom = async (req, res) => {
  try {
    const { userId, dormitoryPostId, roomId } = req.params;
    const dormitoryPosts = await new Promise((resolve, reject) => {
      dormitoryOwner
        .findOne({
          where: { userId },
          attributes: ["id"],
          include: {
            model: dormitoryPost,
            where: { id: dormitoryPostId },
            attributes: ["numberOfRoom"],
            include: {
              model: room,
              where: { id: roomId },
              attributes: ["image"],
            },
          },
        })
        .then((record) => {
          if (record) resolve(record.dormitoryPosts);
        })
        .catch((err) => {
          reject(err);
        });
    });
    if (dormitoryPosts.length === 0 || !dormitoryPosts) {
      return res.status(403).json({ status: "failed", message: "not allowed" });
    }
    // return res.status(200).json(dormitoryPosts);
    console.log("hhh=", dormitoryPosts[0].rooms[0].image);
    const URL = dormitoryPosts[0].rooms[0].image;
    const numberOfRoom = dormitoryPosts[0].numberOfRoom - 1;

    await room
      .destroy({ where: { id: roomId, dormitoryPostId } })
      .then(async (count) => {
        //console.log(count);
        if (count === 1) {
          {
            if (URL) {
              const numberImage = URL.split("%2F")[1].split("?")[0];
              const nameImage = `/dormitoryposts/${numberImage}`;
              await deleteFile(nameImage);
            }
            await dormitoryPost.update(
              { numberOfRoom },
              { where: { id: dormitoryPostId } }
            );
            return res
              .status(204)
              .json({ status: "success", message: "deleted Successfully" });
          }
        } else
          return res
            .status(404)
            .json({ status: "failed", message: "this post not found" });
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    console.log("My error:", err);
    return res
      .status(500)
      .json({ status: "failed", message: "Internal Server Error" });
  }
};
