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
const { formatDate, localFormatter } = require("../../utils/formatDate");
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
      return res.status(500).json({
        status: "failed",
        message: "Internal Server Error",
      });
    });
});
exports.removeMajor = async (req, res, next) => {
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
};
exports.removeCategory = catchAsync(async (req, res, next) => {
  try {
    const id = req.params.categoryId;
    const count = await new Promise((resolve, reject) => {
      catigory
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
exports.addCatigory = async (req, res, next) => {
  const data = req.body;
  catigory
    .create(data)
    .then((record) => {
      res.status(201).json({
        status: "success",
        id: record.id,
        message: "created successfully",
      });
    })
    .catch((err) => {
      console.log(err);
      if (err.name === "SequelizeUniqueConstraintError")
        return res.status(409).json({
          status: "failed",
          message: "already created",
        });
      return res.status(500).json({
        status: "failed",
        message: "Internal Server Error",
      });
    });
};
exports.searchPostByDate = async (req, res, next) => {
  try {
    const { type, studentId } = req.query;
    console.log("GG", type, studentId);
    let include = [
      {
        model: student,
        attributes: ["image", "userId", "blocked"],
        include: [
          {
            model: user,
            attributes: ["username", "phoneNum", "email"],
          },
        ],
      },
    ];
    let reported = false;
    if (type.toLowerCase() === "reported") {
      reported = true;
      include = [
        ...include,
        {
          model: report,
          attributes: ["id", "message"],
          include: {
            model: student,
            attributes: ["id", "image"],
            include: {
              model: user,
              attributes: ["username"],
            },
          },
        },
      ];
    }
    const data = await new Promise((resolve, reject) => {
      post
        .findAll({
          attributes: [
            "id",
            "description",
            "image",
            "reservedBy",
            "createdAt",
            "studentId",
          ],
          include: include,
        })
        .then((record) => {
          resolve(record);
        })
        .catch((err) => {
          reject(err);
        });
    });
    let retrievedData = [];
    data.map((item) => {
      const itemIsReported = item.reports && item.reports.length > 0;
      const retrievedItem = {
        id: item.id,
        description: item.description,
        image: item.image,
        reports: item?.reports,
        studentImage: item.student.image,
        userId: item.student.userId,
        username: item.student.user.username,
        studentId: item.studentId,
        blocked: item.student.blocked,
        createdAt: formatDate(item.createdAt),
      };
      console.log(studentId);
      console.log(itemIsReported);
      if (studentId) {
        console.log(studentId);
        if (
          (!reported || itemIsReported) &&
          retrievedItem.studentId === parseInt(studentId)
        ) {
          console.log("one");
          retrievedData.push(retrievedItem);
        }
      } else if (!reported || itemIsReported) {
        console.log("two");
        console.log(reported);
        retrievedData.push(retrievedItem);
      }
    });
    res.status(200).json(retrievedData);
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
          // where: {
          //   createdAt: {
          //     [Op.gte]: lower,
          //     [Op.lte]: upper,
          //   },
          // },
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

    const reportedPosts = await report
      .findAll({
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
      })
      .catch((err) => {
        throw err;
      });

    return res.status(200).json(reportedPosts);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: "failed", message: "Internal Server Error" });
  }
};
