const { major, catigory } = require("../../models");
const catchAsync = require("../../utils/catchAsync");
exports.getCatigory = catchAsync(async (_, re) => {
  const data = await new Promise((resolve, _) => {
    catigory.findAll({ attributes: ["name", "id"] }).then((record) => {
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
