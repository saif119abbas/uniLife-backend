const AppError = require("../../utils/appError");
const { user, restaurant } = require("../../models");
const catchAsync = require("../../utils/catchAsync");
exports.getResturants = catchAsync(async (_, res) => {
  const users = await user.findAll({
    attributes: ["id", "username", "email", "phoneNum"],
    where: { role: process.env.RESTAURANT },
  });
  let data = [];
  for (const user of users) {
    const item = { id: "", username: "", email: "", phoneNum: "", image: "" };
    const { id, image } = await new Promise((resolve, reject) => {
      restaurant
        .findOne({ attributes: ["id", "image"], where: { userId: user.id } })
        .then((record) => {
          resolve(record);
        });
    });
    item.id = id;
    item.username = user.username;
    item.email = user.email;
    item.phoneNum = user.phoneNum;
    item.image = image;
    data.push(item);
  }
  if (data.length === 0)
    return res.status(404).json({
      status: "failed",
      message: "no restaurants",
    });
  return res.status(200).json({
    status: "success",
    data,
  });
});
exports.getResturant = catchAsync(async (req, res) => {
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
});
