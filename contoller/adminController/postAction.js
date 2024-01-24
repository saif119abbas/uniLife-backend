const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const {
  major,
  catigory,
  post,
  student,
  user,
  report,
} = require("../../models");
const { Op } = require("sequelize");
const { formatDate } = require("../../utils/formatDate");
exports.addMajor = catchAsync(async (req, res, next) => {
  const data = req.body;
  major
    .create(data)
    .then((record) => {
      res.status(201).json({
        status: "success",
        message: "created successfully",
        id: record.id,
      });
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
exports.removeMajor = catchAsync(async (req, res, next) => {
  try {
    const id = req.params.majorId;
    const count = await new Promise((resolve, reject) => {
      major
        .destroy({ where: { id } })
        .then((count) => {
          resolve(count);
        })
        .catch((err) => {
          reject(err);
        });
    });
    if (count === 1)
      return res.status(204).json({
        status: "success",
        message: "deleted successfully",
      });
    return res.status(404).json({
      status: "failed",
      message: "not found",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "failed",
      message: "Internal Server Error",
    });
  }
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
  try {
    const { type, studentId } = req.body;
    let include = [
      {
        model: student,
        //as: "reservedBy",
        attributes: ["image", "userId"],
        include: [
          {
            model: user,
            attributes: ["username", "phoneNum", "email"],
          },
        ],
      },
    ];
    let data = [];
    let reported = false;
    if (type.toLowerCase() === "reported") {
      reported = true;
      include = [
        ...include,
        {
          model: report,
          attributes: ["id", "message", "reportedStudent"],
        },
      ];
    }
    data = await new Promise((resolve, reject) => {
      post
        .findAll({
          attributes: ["id", "description", "image", "reservedBy", "createdAt"],
          include: include,
          /*{
              model: student,
              as: "reservedBy",
              attributes: ["image"],
              include: [
                {
                  model: user,
                  attributes: ["username", "phoneNum", "email"],
                },
              ],
            },*/
        })
        .then((record) => {
          resolve(record);
        })
        .catch((err) => {
          reject(err);
        });
    });
    data = data.map((item) => {
      const itemIsReported = item.reports && item.reports.length;

      const retrievedItem = {
        id: item.id,
        description: item.description,
        image: item.image,
        image: item.image,
        studentImage: item.student.image,
        userId: item.student.userId,
        username: item.student.user.username,
      };
      if (!reported || itemIsReported) {
        return retrievedItem;
      }
    });
    /*if (reported) {
        if (itemIsReported) return retrievedItem;
        return {};
      }
      return retrievedItem;*/
    res.status(200).json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: "falied",
      message: "Internal Server Error",
    });
  }
};
exports.getLastPosts = async (req, res, next) => {
  try {
    data = await new Promise((resolve, reject) => {
      post
        .findAll({
          include: [
            {
              model: student,
              attributes: ["image"],
              include: [
                {
                  model: user,
                  attributes: ["username"],
                },
              ],
            },
            ,
            {},
          ],
        })
        .then((data) => {
          resolve(data);
        })
        .catch((err) => reject(err));
    });
    // const createdAt = formatDate(item.createdAt);
    const retrievedData = data.map((item) => ({
      ...item.get(),
      profileImage: item.student.image,
      username: item.student.user.username,
      createdAt: formatDate(item.createdAt),
      student: undefined,
    }));
    return res.status(200).json(retrievedData);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: "failed", message: "Internal server error" });
  }
};

exports.reportedPost = async (_, res) => {
  try {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const reportedPosts = await report.findAll({
      where: {
        createdAt: {
          [Op.lt]: today,
          [Op.gte]: yesterday,
        },
      },
      attributes: ["id", "message"],
      include: [
        {
          model: post,
          attributes: ["id", "image", "description", "createdAt"],
          include: {
            model: student,
            as: "reportedStudent",
            attributes: ["id", "image", "major"],
            include: {
              model: user,
              attributes: ["id", "username"],
            },
          },
        },
        {
          model: student,
          attributes: ["id"],
          include: {
            model: user,
            attributes: ["id", "username"],
          },
        },
      ],
    });

    return res.status(200).json(reportedPosts);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: "failed", message: "Internal Server Error" });
  }
};
