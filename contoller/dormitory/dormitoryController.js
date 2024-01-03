const AppError = require("../../utils/appError");
const {
  dormitoryOwner,
  dormitoryPost,
  user,
  room,
  images,
} = require("../../models");
const { addDocument } = require("../handelFactrory");
const catchAsync = require("../../utils/catchAsync");
const { UploadFile, getURL, deleteFile } = require("../../firebaseConfig");

exports.addDormitoryPost = catchAsync(async (req, res, next) => {
  const data = JSON.parse(req.body.data);
  const files = req.files;
  const userId = req.params.userId;
  try {
    const myUser = await dormitoryOwner.findOne({
      attributes: ["id"],
      where: { userId },
    });
    const dormitoryOwnerId = myUser.id;
    console.log("dormitoryOwnerId", dormitoryOwnerId);
    const post = {
      descrption: data.description,
      location: data.location,
      dormitoryOwnerId,
    };
    let count = 0;
    console.log("post", post);
    /* const result1 = await addDocument(dormitoryPost, post, res, next);
    const result = await new Promise(async (resolve, reject) => {
      try {
        const result = await addDocument(dormitoryPost, post, res, next);
        console.log("The result:", result);
        resolve(result);
      } catch (err) {
        console.log("The err", err);
        reject(new AppError("An error occurred please try again", 500));
      }
    });
    console.log("The result was", result1);
    res.status(201).json({ result });*/
    const dormitoryPostId = await new Promise((resolve, reject) => {
      dormitoryPost.create(post).then((record) => {
        if (record) resolve(record.id);
        else
          return res
            .status(400)
            .json({ status: "failed", message: "please try again" });
      });
    });
    const rooms = data.rooms.map((myRoom) => ({
      ...myRoom,
      dormitoryPostId,
    }));

    await room.bulkCreate(rooms).then((record) => {
      console.log(record);
    });
    const URLS = await Promise.all(
      files.map(async (file) => {
        count++;
        const nameImage = `/dormitoryposts/${dormitoryPostId}_${count}.jpg`;
        await UploadFile(file.buffer, nameImage);
        const image = await getURL(nameImage);
        console.log(image);
        // const item={image,dormitoryPostId}
        return { image, dormitoryPostId };
      })
    );
    console.log("URLS", URLS);
    await images.bulkCreate(URLS).then();
    return res
      .status(201)
      .json({ status: "success", message: "created Successfuly" });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError")
      return result.status(409).json({
        status: "failed",
        message: "This room is already created ",
      });
    console.log("The error", err);
    return next(new AppError("An error occured please try again", 500));
  }
});
exports.deleteDormitoryPost = catchAsync(async (req, res, next) => {
  try {
    const id = req.params.dorimtoryPostid;
    const userId = req.params.userId;
    const dormitoryOwnerId = await new Promise((resolve) => {
      dormitoryOwner.findOne({ where: { userId }, attributes: ["id"] }).then(record => {
        if (record)
          resolve(record.id)
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
