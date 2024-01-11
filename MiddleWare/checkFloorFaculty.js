const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { facultyFloor } = require("../models");
exports.floorFacultyCheck = catchAsync(async (req, res, next) => {
  const { floorId, facultyId } = req.params;

  const data = await new Promise((resolve, reject) => {
    facultyFloor
      .findOne({ where: { facultyId, floorId } })
      .then((record) => resolve(record));
  });
  if (!data)
    return res
      .status(400)
      .json({ message: "this floor not added to this faculty" });
  return next();
});
