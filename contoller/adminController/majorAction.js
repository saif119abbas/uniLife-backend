const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const { major } = require("../../models");
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
