const AppError = require("../../utils/appError");
const {
  dormitoryOwner,
  dormitoryPost,
  room,
  user,
  images,
} = require("../../models");
const catchAsync = require("../../utils/catchAsync");
exports.getAllDormitoryPost = catchAsync(async (req, res, next) => {
  try {
    const dorimtoryPosts = await dormitoryPost.findAll({
      order: [["createdAt", "DESC"]],
      attributes: ["id", "descrption", "location"],
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
        description: post.descrption,
        location: post.location,
        room: post.rooms,
        images: post.images,
      };
      data.push(item);
    }
    res.status(200).json({ data });
  } catch (err) {
    console.log("Myerr", err);
    return next(new AppError("An error occurred please try again", 500));
  }
});
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
    console.log("My err", err);
    return next(new AppError("An error occurred please try again", 500));
  }
});
exports.getMyPosts = catchAsync(async (req, res, next) => {
  try {
    const myPosts = await dormitoryPost.findAll({
      attributes: ["id", "descrption", "location"],
      order: [["createdAt", "DESC"]],
      include: [
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
    if (!myPosts)
      return res
        .status(404)
        .json({ status: "failed", message: "you don't have any post" });
    res.status(200).json({ data: myPosts });
  } catch (err) {
    console.log("Myerr", err);
    return next(new AppError("An error occurred please try again", 500));
  }
});
