const bcrypt = require("bcrypt");
const AppError = require("../../utils/appError");
const { getQRcode, compareQRcode } = require("../../utils/qrcode");
const { UploadFile, getURL } = require("../../firebaseConfig");
const {
  faculty,
  facultyFloor,
  floor,
  floorClass,
  classroom,
} = require("../../models");
const catchAsync = require("../../utils/catchAsync");
exports.addFaculty = catchAsync(async (req, res, next) => {
  const data = req.body;
  console.log(data);
  await faculty.create(data).then(() => {
    return res
      .status(201)
      .json({
        status: "success",
        message: "added successfully",
      })
      .catch((err) => {
        console.log("my err:", err);
        if (err.name === "SequelizeUniqueConstraintError")
          res.status(409).json({
            status: "failed",
            message: "This faculty is already added",
          });

        return next(new AppError("An error occured please try again ", 500));
      });
  });
});
const addFacultyFLoors = async (facultyFacultyNumber, floorId, res, next) => {
  console.log("addFaculty");
  try {
    await facultyFloor.create({ facultyFacultyNumber, floorId });

    const fromattedData = { facultyFacultyNumber, floorId };
    const URL = await getQRcode(JSON.stringify(fromattedData));
    const file = Buffer.from(URL, "base64");

    const nameImage = `/qrcode/${floorId}_${facultyFacultyNumber}.png`;
    const metadata = {
      contentType: "image/png",
    };
    await UploadFile(file, nameImage, metadata);
    const image = await getURL(nameImage);
    await facultyFloor
      .update({ image }, { where: { floorId, facultyFacultyNumber } })
      .then((count) => {
        if (count[0] === 1)
          return res.status(201).json({
            status: "success",
            message: "added successfully",
          });
        else
          return next(new AppError("An error occured please try again ", 500));
      });
  } catch (err) {
    console.log(err);
    if (err.name === "SequelizeUniqueConstraintError")
      res.status(409).json({
        status: "failed",
        message: "This floor is already added",
      });

    return next(new AppError("An error occured please try again ", 500));
  }
};
const addFloorClassRooms = async (classroomId, floorId, res, next) => {
  await floorClass
    .create({ classroomId, floorId })
    .then(() => {
      return res.status(201).json({
        status: "success",
        message: "added successfully",
      });
    })
    .catch((err) => {
      console.log(err);
      if (err.name === "SequelizeUniqueConstraintError")
        res.status(409).json({
          status: "failed",
          message: "This classromm is already added",
        });

      return next(new AppError("An error occured please try again ", 500));
    });
};
exports.addFloor = catchAsync(async (req, res, next) => {
  const data = req.body;
  let status = false;
  const facultyFacultyNumber = req.params.facultyId;
  try {
    const id = await new Promise(async (resolve, reject) => {
      floor
        .create(data)
        .then((record) => {
          status = true;
          resolve(record.id);
        })
        .catch((err) => {
          console.log(err);
          if (err.name === "SequelizeUniqueConstraintError") {
            floor.findOne({ where: { name: data.name } }).then((record) => {
              if (record.id) resolve(record.id);
            });
            status = true;
          } else reject(err);
        });
    });
    if (status) await addFacultyFLoors(facultyFacultyNumber, id, res, next);
    else return next(new AppError("An error occured please try again ", 500));
  } catch (err) {
    console.log("My error occurred", err);
    return next(new AppError("An error occured please try again ", 500));
  }
});
exports.addClassRoom = catchAsync(async (req, res, next) => {
  const data = req.body;
  let status = false;
  const floorId = req.params.floorId;
  try {
    const id = await new Promise((resolve, reject) => {
      classroom
        .create(data)
        .then((record) => {
          status = true;
          resolve(record.id);
        })
        .catch((err) => {
          console.log(err);
          if (err.name === "SequelizeUniqueConstraintError") {
            classroom
              .findOne({ where: { number: data.number } })
              .then((record) => {
                if (record.id) resolve(record.id);
              });
            status = true;
          } else reject(err);
        });
    });
    console.log(id);
    if (status) await addFloorClassRooms(id, floorId, res, next);
    else return next(new AppError("An error occured please try again ", 500));
  } catch (err) {
    console.log("My error occurred", err);
    return next(new AppError("An error occured please try again ", 500));
  }
});
