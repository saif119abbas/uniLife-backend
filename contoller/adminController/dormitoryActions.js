const bcrypt = require("bcrypt");
const AppError = require("../../utils/appError");
const { dormitoryOwner, user } = require("../../models");
const catchAsync = require("../../utils/catchAsync");
const { localFormatter } = require("../../utils/formatDate");
const { UploadFile, getURL, deleteFile } = require("../../firebaseConfig");
exports.addDormitoryOwner = async (req, res, next) => {
  try {
    console.log("data=", req.body.data);
    const dormitoryOwnerData = JSON.parse(req.body.data);
    const file = req.file;
    if (dormitoryOwnerData.password !== dormitoryOwnerData.confirmPassword) {
      return res.status(400).json({
        status: "failed",
        message: "password and confirm password don't matched",
      });
    }
    dormitoryOwnerData.confirmPassword = undefined;
    const hash = await new Promise((resolve, reject) => {
      bcrypt.hash(dormitoryOwnerData.password, 12, (err, hash) => {
        if (err) reject(err);
        else resolve(hash);
      });
    });
    dormitoryOwnerData.password = hash;
    const SSN = dormitoryOwnerData.SSN;
    dormitoryOwnerData.role = process.env.DORMITORY;
    const userId = await new Promise((resolve, reject) => {
      user
        .create(dormitoryOwnerData)
        .then((data) => {
          resolve(data.id);
        })
        .catch((err) => {
          reject(err);
        });
    });
    if (!userId)
      return res.status(400).json({
        status: "failed",
        message: "An error occurred please try again",
      });
    const nameImage = `/dormitoryOwner/${userId}`;
    console.log(file);
    await UploadFile(file.buffer, nameImage);
    const image = await getURL(nameImage);
    console.log(image);

    await new Promise(async (resolve, reject) => {
      dormitoryOwner
        .create({ SSN, userId, image })
        .then(() => {
          return res.status(201).json({
            status: "success",
            message: "created successfully",
          });
        })
        .catch(async (err) => {
          if (err.name === "SequelizeUniqueConstraintError") {
            await user.destroy({ where: { id: userId } }).then((count) => {
              if (count === 1)
                return res.status(409).json({
                  status: "failed",
                  message: "This account is already created",
                });
            });
          } else reject(err);
        });
    });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError")
      return res.status(409).json({
        status: "failed",
        message: "This account is already created",
      });
    console.log("My err", err);

    return res.status(500).json({
      status: "failed",
      message: "Internal Server Error",
    });
  }
};
exports.editDormitoryOwner = async (req, res) => {
  try {
    const dormitoryId = req.params.dormitoryId;
    const data = JSON.parse(req.body.data);
    const file = req.file;
    const nameImage = `/dormitoryOwner/${dormitoryId}`;
    console.log(file);
    let image = "";
    const dormitoryOwnerData = {
      SSN: data.SSN,
    };
    if (file) {
      await UploadFile(file.buffer, nameImage);
      image = await getURL(nameImage);
      dormitoryOwnerData.image = image;
    }
    console.log(image);
    const userData = {
      email: data.email,
      phoneNum: data.email,
      username: data.username,
      phoneNum: data.phoneNum,
    };

    const count = await new Promise((resolve, reject) => {
      user
        .update(userData, {
          where: { id: dormitoryId, role: process.env.DORMITORY },
        })
        .then(([count]) => {
          resolve(count);
        })
        .catch((err) => {
          reject(err);
        });
    });
    if (count === 1) {
      dormitoryOwner
        .update(dormitoryOwnerData, { where: { userId: dormitoryId } })
        .then(([count]) => {
          if (count === 1)
            return res
              .status(200)
              .json({ status: "Success", message: "Updated successfully" });
          else
            return res
              .status(404)
              .json({ status: "failed", message: "not found" });
        })
        .catch((err) => {
          throw err;
        });
    } else
      return res.status(404).json({ status: "failed", message: "not found" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: "failed", message: "Internal Server Error" });
  }
};
exports.deleteDormitoryOwner = async (req, res) => {
  const dormitoryId = req.params.dormitoryId;
  console.log("dormitoryId=", dormitoryId);
  dormitoryOwner
    .destroy({ where: { userId: dormitoryId } })
    .then((deleteCount) => {
      if (deleteCount > 1)
        return res.status(403).json({
          status: "failed",
          message: "not allowed",
        });
      else if (deleteCount === 1)
        user
          .destroy({ where: { id: dormitoryId, role: process.env.DORMITORY } })
          .then(async (deleteCount) => {
            if (deleteCount > 1)
              res.status(403).json({
                status: "failed",
                message: "not allowed",
              });
            else if (deleteCount === 1) {
              const nameImage = `/dormitoryOwner/${dormitoryId}`;
              await deleteFile(nameImage);
              res.status(204).json({
                status: "success",
                message: "deleted successfully",
              });
            } else if (deleteCount === 0)
              res.status(404).json({
                status: "failed",
                message: "not found1",
              });
          })
          .catch((err) => {
            console.log(err);
            return next(new AppError("An error occured please try again"), 500);
          });
      else if (deleteCount === 0)
        res.status(404).json({
          status: "failed",
          message: "not found2",
        });
    })
    .catch((err) => {
      console.log(err);
      return res
        .status(500)
        .json({ status: "failed", message: "Internal Server Error" });
    });
};
exports.getDormitoryOwners = catchAsync(async (_, res) => {
  const users = await user.findAll({
    attributes: ["id", "username", "email", "phoneNum", "createdAt"],
    where: { role: process.env.DORMITORY },
    include: [
      {
        model: dormitoryOwner,
        attributes: ["SSN", "image"],
      },
    ],
  });

  let data = [];
  data = users.map((user) => ({
    ...user.get(),
    createdAt: localFormatter(user.createdAt),
    SSN: user.dormitoryOwner.SSN,
    image: user.dormitoryOwner.image,
    dormitoryOwner: undefined,
  }));
  if (data.length === 0) return res.status(200).json([]);
  return res.status(200).json(data);
});
