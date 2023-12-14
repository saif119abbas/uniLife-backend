const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { dormitoryOwner, dormitoryPost, user, room } = require("../models");
exports.dormitoryPostCheck = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  const id = req.params.dorimtoryPostid;
  const myDorimtoryOwner = await dormitoryOwner.findOne({
    attributes: ["id"],
    where: { userId },
  });
  if (!myDorimtoryOwner) {
    return res.status(403).json({
      status: "failed",
      message: "not allowed",
    });
  }
  const dormitoryOwnerId = myDorimtoryOwner.id;
  const myPost = await dormitoryPost.findOne({
    attributes: ["dormitoryOwnerId"],
    where: { id },
  });
  if (!myPost) {
    return res.status(404).json({
      status: "failed",
      message: "not found",
    });
  }
  if (myPost.dormitoryOwnerId !== dormitoryOwnerId)
    return res.status(403).json({
      status: "failed",
      message: "not allowed",
    });
  else return next();
});
