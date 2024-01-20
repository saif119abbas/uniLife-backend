const {
  savedDormitory,
  student,
  dormitoryPost,
  room,
} = require("../../models");
const { localFormatter } = require("../../utils/formatDate");

//const { pushNotification } = require("../../notification");
exports.savePost = async (req, res, next) => {
  try {
    const { userId, dormitoryPostId } = req.params;
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
    if (!studentId)
      return res.status(404).json({
        status: "failed",
        message: "This user not found",
      });
    await savedDormitory
      .create({ studentId, dormitoryPostId })
      .then(() => {
        return res.status(201).json({
          status: "success",
          message: "created successfully",
        });
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    console.log("The error", err);
    if (err.name === "SequelizeUniqueConstraintError")
      return res.status(200).json({
        status: "success",
        message: "This post has already been saved",
      });
    return res.status(500).json({
      status: "failed",
      message: "Internal Server Error",
    });
  }
};
exports.gtesSavePost = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const data = await new Promise((resolve, reject) => {
      student
        .findOne({
          where: { userId },
          attributes: ["id"],
          include: [
            {
              model: savedDormitory,
              attributes: ["createdAt", "id"],
              include: [
                {
                  model: dormitoryPost,
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
    const { savedDormitories } = data;
    const retrieveData = savedDormitories.map((item) => {
      const { id, dormitoryPost } = item;
      const dormitoryPostId = dormitoryPost.id;
      const savedAt = localFormatter(item.createdAt);
      dormitoryPost.id = undefined;
      return {
        dormitoryPostId,
        id,
        savedAt,
        ...dormitoryPost.get(),
      };
    });
    return res.status(200).json(retrieveData);
  } catch (err) {
    console.log("The error", err);
    return res.status(500).json({
      status: "failed",
      message: "Internal Server Error",
    });
  }
};
exports.removeSaved = async (req, res) => {
  try {
    const { userId, dormitoryPostId } = req.params;

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
    console.log(studentId, dormitoryPostId);
    await savedDormitory
      .destroy({ where: { studentId, dormitoryPostId } })
      .then((count) => {
        if (count === 1)
          return res.status(204).json({
            status: "success",
            message: "remove successfully",
          });
        else
          return res.status(404).json({
            status: "failed",
            message: "not found post",
          });
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    console.log("The error", err);
    return res.status(500).json({
      status: "failed",
      message: "Internal Server Error",
    });
  }
};
