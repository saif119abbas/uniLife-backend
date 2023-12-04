const { Op } = require("sequelize");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const { intersection } = require("../../utils/arrayActions");
const {
  student,
  user,
  catigory,
  major,
  post,
  postMajor,
} = require("../../models");
const addMajors = async (data, res, next) => {
  const { majors, postId } = data;
  for (const name of majors) {
    try {
      const majorId = await new Promise((resolve, reject) => {
        major
          .findOne({ attributes: ["id"], where: { name } })
          .then((record) => {
            console.log("The major id", record.id);
            if (record.id) {
              console.log("Found");
              resolve(record.id);
            } else
              reject(new AppError("An error occurred please try again", 500));
          });
      });
      console.log("next:", majorId);
      const Item = { majorId, postId };
      await postMajor.create(Item);
    } catch (err) {
      console.log("The err", err);
      return next(new AppError("An error occurred please try again", 500));
    }
  }
  return res.status(201).json({
    status: "success",
    message: "created successfully",
  });
};
exports.createPost = catchAsync(async (req, res, next) => {
  console.log("The body:", req.body.data);
  const data = JSON.parse(req.body.data);
  const userId = req.params.userId;
  const myStudent = await student.findOne({
    attributes: ["id"],
    where: { userId },
  });
  const studentId = myStudent.id;
  const image = req.file.buffer;
  console.log("Image:", image);
  const postData = {
    description: data.description,
    studentId,
    image,
  };
  await post
    .create(postData)
    .then((record) => {
      const majors = data.majors;
      catigory.create({ postId: record.id, name: data.catigory });
      addMajors({ majors, postId: record.id }, res, next);
    })
    .catch((err) => {
      console.log("The err:", err);
      if (err.name === "SequelizeUniqueConstraintError")
        return res.status(409).json({
          status: "failed",
          message: "already created",
        });
      return next(new AppError("An error occurred please try again", 500));
    });
});
exports.getPostStudent = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  const studentId = await new Promise((resolve, reject) => {
    student
      .findOne({ attributes: ["id"], where: { userId } })
      .then((record) => {
        if (record.id) resolve(record.id);
        else
          res.status(400).json({
            status: "failed",
            message: "not found user",
          });
      });
  });
  // console.log("body", req.body);
  const { myCatigory, myMajor } = req.body;
  let condition = { studentId: { [Op.not]: studentId } };
  let ids = [];
  if (myCatigory) {
    const catigories = await catigory.findAll({
      attributes: ["postId"],
      where: { name: myCatigory },
    });

    ids = catigories.map((item) => item.postId);
  }
  if (myMajor) {
    const majors = await major.findAll({
      attributes: ["id"],
      where: { name: myMajor },
    });
    const majorsId = majors.map((item) => item.id);
    const Items = await postMajor.findAll({
      attributes: ["postId"],
      where: { majorId: { [Op.in]: majorsId } },
    });
    const tempArray = Items.map((item) => item.postId);
    if (ids.length > 0) ids = intersection(ids, tempArray);
    else ids = [...tempArray];
  }
  condition = { ...condition, id: { [Op.in]: ids } };
  console.log("ids", ids);
  const posts = await post.findAll({
    where: condition,
  });
  if (!posts || posts.length === 0)
    return res.status(404).json({
      status: "failed",
      message: "there is no post",
    });
  let data = [];

  for (let item of posts) {
    const reserved = item.reservedBy ? true : false;
    const { description, id, image } = item;
    const myStudent = await student.findOne({
      attributes: ["userId"],
      where: { id: item.studentId },
    });
    if (!myStudent)
      return res.status(404).json({
        status: "failed",
        message: "there is no post",
      });
    const myUser = await user.findOne({
      attributes: ["username"],
      where: { id: myStudent.userId },
    });
    const { username } = myUser;
    data.push({ id, username, description, image, reserved });
  }
  res.status(200).json({ data });
});
exports.reservesdPost = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  const myStudent = await student.findOne({
    attributes: ["blocked", "id"],
    where: { userId },
  });
  if (myStudent.blocked)
    return res.status(403).json({
      status: "failed",
      message: "you are blocked, you can't reserved post",
    });
  const reservedBy = myStudent.id;
  const id = req.params.postId;
  await post
    .update(
      { reservedBy },
      { where: { reservedBy: null, id, studentId: { [Op.not]: myStudent.id } } }
    )
    .then((count) => {
      if (count[0] === 1)
        return res
          .status(200)
          .json({ status: "success", message: "reserved successfully" });
      else if (count[0] === 0)
        return res.status(404).json({
          status: "failed",
          message: "not found post",
        });
    });
});
exports.searchPost = catchAsync(async (req, res, next) => {
  const desc = req.body.description;
  const userId = req.params.userId;
  const myStudent = await student.findOne({
    attributes: ["id", "blocked"],
    where: { userId },
  });
  const posts = await post.findAll({
    where: {
      description: { [Op.like]: `%${desc}%` },
      studentId: { [Op.not]: myStudent.id },
    },
  });
  if (!posts || posts.length === 0)
    return res.status(404).json({ message: "no post found" });
  /*if (myStudent.blocked)
    return res.status(403).json({
      status: "failed",
      message:"not allowed"
    })*/
  let data = [];
  for (let item of posts) {
    const reserved = item.reservedBy ? true : false;
    const { description, id, image } = item;
    const myStudent = await student.findOne({
      attributes: ["userId"],
      where: { id: item.studentId },
    });
    if (!myStudent)
      return res.status(404).json({
        status: "failed",
        message: "there is no post",
      });
    const myUser = await user.findOne({
      attributes: ["username"],
      where: { id: myStudent.userId },
    });
    const { username } = myUser;
    data.push({ id, username, description, image, reserved });
  }
  res.status(200).json({ data });
});
