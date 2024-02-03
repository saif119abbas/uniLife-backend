const { major, catigory } = require("../../models");
const catchAsync = require("../../utils/catchAsync");
exports.getCatigory = catchAsync(async (_, res) => {
  try {
    const data = await new Promise((resolve, reject) => {
      catigory
        .findAll({ attributes: ["name", "id"] })
        .then((record) => {
          if (record) resolve(record);
          else
            return res.status(404).json({
              status: "failed",
              message: "not found",
            });
        })
        .catch((err) => reject(err));
    });
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      status: "failed",
      message: "Internal Server error",
    });
  }
});
exports.getMajor = catchAsync(async (_, res) => {
  try {
    const data = await new Promise((resolve, reject) => {
      major
        .findAll({ attributes: ["name", "id"] })
        .then((record) => {
          if (record) resolve(record);
          else
            return res.status(404).json({
              status: "failed",
              message: "not found",
            });
        })
        .catch((err) => reject(err));
    });
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      status: "failed",
      message: "Internal Server error",
    });
  }
});
