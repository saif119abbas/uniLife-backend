const AppError = require("../../utils/appError");
const {
  user,
  restaurant,
  catigory,
  major,
  post,
  student,
} = require("../../models");
const { UploadFile, getURL, deleteFile } = require("../../firebaseConfig");
const catchAsync = require("../../utils/catchAsync");
exports.getResturants = catchAsync(async (_, res) => {
  const data = await user.findAll({
    attributes: ["id", "username", "email", "phoneNum", "createdAt"],
    where: { role: process.env.RESTAURANT },
    order: [[{ model: restaurant }, "rating", DESC]],
    include: [
      {
        model: restaurant,
        attributes: ["image", "rating", "restaurantDesc", "isOpen"],
      },
    ],
  });
  console.log(data);
  if (data.length === 0) return res.status(200).json([]);
  const retrievedData = data.map((item) => ({
    ...item.get(),
    image: item.restaurant.image,
    rating: item.restaurant.rating,
    restaurantDesc: item.restaurant.restaurantDesc,
    isOpen: item.restaurant.isOpen,
    restaurant: undefined,
  }));
  return res.status(200).json(retrievedData);
});
/*exports.getResturant = catchAsync(async (req, res) => {
  const resturantId = req.params.resturantId;
  const id = await new Promise((resolve, reject) => {
    restaurant
      .findOne({ attributes: ["userId"], where: { id: resturantId } })
      .then((record) => {
        resolve(record.userId);
      });
  });
  const data = await user.findOne({
    attributes: ["id", "username", "email", "phoneNum"],
    where: { id, role: process.env.RESTAURANT },
  });
  if (data.length === 0)
    return res.status(404).json({
      status: "failed",
      message: "no restaurants",
    });
  return res.status(200).json({
    status: "success",
    data,
  });
});*/
exports.getCatigory = catchAsync(async (_, res) => {
  const data = await new Promise((resolve, _) => {
    catigory
      .findAll({ attributes: ["name", "id"], order: [["id", "ASC"]] })
      .then((record) => {
        if (record) resolve(record);
        else
          return res.status(404).json({
            status: "failed",
            message: "not found",
          });
      });
  });
  return res.status(200).json(data);
});
exports.getMajor = catchAsync(async (_, res) => {
  const data = await new Promise((resolve, _) => {
    major.findAll({ attributes: ["name", "id"] }).then((record) => {
      if (record) resolve(record);
      else
        return res.status(404).json({
          status: "failed",
          message: "not found",
        });
    });
  });
  return res.status(200).json(data);
});
exports.deletePost = catchAsync(async (req, res, next) => {
  try {
    const { postId, studentId } = req.params;
    const image = await new Promise((resolve, reject) => {
      post.findOne({ where: { id: postId, studentId } }).then((res) => {
        if (res) resolve(res.image);
      });
    });
    const baseUrl = image.split("?")[0].split("/");
    const path = baseUrl[baseUrl.length - 1].split("%2F");
    const nameImage = `student post/${path[path.length - 1]}`;
    const deleteCount = await new Promise((resolve, _) => {
      post.destroy({ where: { id: postId, studentId } }).then((deleteCount) => {
        resolve(deleteCount);
      });
    });
    if (deleteCount === 1) {
      await deleteFile(nameImage);
      return res.status(204).json({});
    } else
      return res.status(404).json({
        status: "failed",
        message: "not found",
      });
  } catch (error) {
    console.error("Error creating post:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        status: "failed",
        message: "Already created",
      });
    }

    return next(new AppError("An error occurred, please try again", 500));
  }
});
