const AppError = require("../../utils/appError");
const {
  dormitoryOwner,
  dormitoryPost,
  room,
  user,
  savedDormitory,
  student,
} = require("../../models");
const catchAsync = require("../../utils/catchAsync");
const { Op } = require("sequelize");
const { localFormatter } = require("../../utils/formatDate");

exports.getAllDormitoryPost = async (req, res) => {
  try {
    const { userId } = req.params;
    const studentId = await new Promise((resolve, reject) => {
      student
        .findOne({ where: { userId }, attributes: ["id"] })
        .then((record) => {
          resolve(record.id);
        })
        .catch((err) => {
          reject(err);
        });
    });
    console.log("From here=", studentId);
    let ids = await new Promise((resolve, reject) => {
      savedDormitory
        .findAll({ where: { studentId }, attributes: ["dormitoryPostId"] })
        .then((record) => {
          console;
          resolve(record);
        })
        .catch((err) => {
          reject(err);
        });
    });
    console.log("ids=", ids);
    ids = ids.map((item) => item.dormitoryPostId);
    console.log("ids=", ids);
    let condition1 = {};
    let condition2 = {};
    let { type, distance, gender, order, price } = req.body;
    type = type.toLowerCase();
    gender = gender.toLowerCase();
    console.log(type, distance, gender, order, price);
    let DESC = "DESC";
    if (distance) {
      condition1 = { ...condition1, distance: { [Op.lte]: distance } };
    }
    if (gender !== "any") {
      condition1 = { ...condition1, gender };
    }
    if (type !== "any") {
      condition2 = { ...condition2, type };
    }
    if (price) {
      condition2 = { ...condition2, rent: { [Op.lte]: price } };
      DESC = order;
    }
    console.log("D:", DESC);
    const dorimtoryPosts = await dormitoryPost.findAll({
      where: condition1,
      attributes: [
        "id",
        "numberOfRoom",
        "services",
        "lon",
        "lat",
        "distance",
        "gender",
        "image",
        "name",
        "createdAt",
      ],
      include: [
        {
          model: dormitoryOwner,
          attributes: ["userId", "image"],
          include: [
            {
              model: user,
              attributes: ["username", "email", "phoneNum"],
            },
          ],
        },
        {
          model: room,
          where: condition2,

          attributes: [
            "id",
            "type",
            "rent",
            "numberOfPerson",
            "image",
            "avilableSeat",
          ],
        },
      ],
      order: [[{ model: room }, "rent", DESC]],
      separate: true,
    });
    //console.log(dorimtoryPosts);
    if (!dorimtoryPosts) {
      return res
        .status(404)
        .json({ status: "failed", message: "no post found" });
    }
    let data = [];
    for (const post of dorimtoryPosts) {
      console.log("post:", post);
      const saved =
        ids.find((id) => id === parseInt(post.id)) !== undefined ? true : false;

      const item = {
        id: post.id,
        username: post.dormitoryOwner.user.username,
        email: post.dormitoryOwner.user.email,
        phoneNum: post.dormitoryOwner.user.phoneNum,
        numRooms: post.numberOfRoom,
        services: post.services,
        ownerImage: post.dormitoryOwner.image,
        lon: post.lon,
        lat: post.lat,
        room: post.rooms,
        image: post.image,
        gender: post.gender,
        distance: post.distance,
        name: post.name,
        createdAt: localFormatter(post.createdAt),
        saved,
      };
      data.push(item);
    }
    res.status(200).json({ data });
  } catch (err) {
    console.log("The error", err);
    return res.status(500).json({
      status: "failed",
      message: "Internal Server Error",
    });
  }
};
exports.getPost = catchAsync(async (req, res, next) => {
  try {
    const dorimtoryId = req.params.dorimtoryId;
    const dorimtoryPosts = await dormitoryPost.findOne({
      where: { id: dorimtoryId },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: dormitoryOwner,
          attributes: ["userId"],
          include: [
            {
              model: user,
              attributes: ["username", "email", "phoneNum"],
            },
          ],
        },
        {
          model: room,
          attributes: ["typeOfRoom", "rent", "numberOfPerson"],
        },
        {
          model: images,
          attributes: ["image"],
        },
      ],
    });
    console.log(dorimtoryPosts);
    const { location, descrption, rooms } = dorimtoryPosts;
    const data = {
      username: dorimtoryPosts.dormitoryOwner.user.username,
      email: dorimtoryPosts.dormitoryOwner.user.email,
      phoneNum: dorimtoryPosts.dormitoryOwner.user.phoneNum,
      location,
      descrption,
      rooms,
      images: dorimtoryPosts.images,
    };
    res.status(200).json({ data });
  } catch (err) {
    console.log("The error", err);
    return res.status(500).json({
      status: "failed",
      message: "Internal Server Error",
    });
  }
});
exports.getMyPosts = catchAsync(async (req, res, next) => {
  try {
    const myPosts = await dormitoryPost.findAll({
      attributes: [
        "id",
        "numberOfRoom",
        "services",
        "lon",
        "lat",
        "distance",
        "gender",
        "image",
        "name",
      ],
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: room,
          attributes: [
            "id",
            "type",
            "rent",
            "numberOfPerson",
            "image",
            "avilableSeat",
          ],
        },
      ],
    });
    if (!myPosts) return res.status(200).json([]);
    return res.status(200).json({ data: myPosts });
  } catch (err) {
    console.log("The error", err);
    return res.status(500).json({
      status: "failed",
      message: "Internal Server Error",
    });
  }
});
