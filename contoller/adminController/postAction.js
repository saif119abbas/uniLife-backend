const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const { major, catigory, post, student, user } = require("../../models");
const { Op } = require("sequelize");
exports.addMajor = catchAsync(async (req, res, next) => {
  const data = req.body;
  major
    .create(data)
    .then(() => {
      res
        .status(201)
        .json({ status: "success", message: "created successfully" });
    })
    .catch((err) => {
      console.log(err);
      if (err.name === "SequelizeUniqueConstraintError")
        return res.status(409).json({
          status: "failed",
          message: "already created",
        });
      return next(new AppError("An error occurred please try again", 500));
    });
});
exports.addCatigory = catchAsync(async (req, res, next) => {
  const data = req.body;
  catigory
    .create(data)
    .then(() => {
      res
        .status(201)
        .json({ status: "success", message: "created successfully" });
    })
    .catch((err) => {
      console.log(err);
      if (err.name === "SequelizeUniqueConstraintError")
        return res.status(409).json({
          status: "failed",
          message: "already created",
        });
      return next(new AppError("An error occurred please try again", 500));
    });
});
exports.searchPostByDate = async (req, res, next) => {
  const { date } = req.body;
  console.log(date);
  const createdAt = new Date(date);
  createdAt.setHours(0, 0, 0, 0);
  console.log(createdAt);
  try {
    const data = await new Promise((resolve, reject) => {
      post
        .findAll({
          where: {
            createdAt: {
              [Op.gte]: createdAt,
              [Op.lt]: new Date(createdAt.getTime() + 24 * 60 * 60 * 1000),
            },
          },
          attributes: ["id", "description", "image", "reservedBy"],
          include: [
            {
              model: student,
              //as: "reservedBy",
              attributes: ["image"],
              include: [
                {
                  model: user,
                  attributes: ["username", "phoneNum", "email"],
                },
              ],
            },
            {
              model: student,
              as: "reservedBy",
              attributes: ["image"],
              include: [
                {
                  model: user,
                  attributes: ["username", "phoneNum", "email"],
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
    res.status(200).json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: "falied",
      message: "An error occurred please try again",
    });
  }
};
