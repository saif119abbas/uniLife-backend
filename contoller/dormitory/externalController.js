const AppError = require("../../utils/appError");
const { dormitoryOwner, dormitoryPost, room, user } = require("../../models");
const catchAsync = require("../../utils/catchAsync");
const { Op } = require("sequelize");
exports.getAllDormitoryPost = async (req, res, next) => {
  try {
    let condition1 = {};
    let condition2 = {};
    const { type, distance, gender, order } = req.body;
    let DESC = "DESC";
    if (distance) {
      condition1 = { ...condition1, distance: { [Op.lte]: distance } };
      DESC = order;
    }
    if (gender) {
      condition1 = { ...condition1, gender };
    }
    if (type) {
      condition2 = { ...condition2, type };
    }
    const dorimtoryPosts = await dormitoryPost.findAll({
      order: [["distance", DESC]],
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
      ],
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
    });
    if (!dorimtoryPosts)
      return res
        .status(404)
        .json({ status: "failed", message: "no post found" });
    let data = [];
    for (const post of dorimtoryPosts) {
      console.log("post:", post);
      const item = {
        id: post.id,
        username: post.dormitoryOwner.user.username,
        email: post.dormitoryOwner.user.email,
        phoneNum: post.dormitoryOwner.user.phoneNum,
        services: post.services,
        lon: post.lon,
        lat: post.lat,
        room: post.rooms,
        image: post.image,
        gender: post.gender,
        distance: post.distance,
        name: post.name,
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
