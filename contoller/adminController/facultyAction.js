const bcrypt = require("bcrypt");
const AppError = require("../../utils/appError");
const { getQRcode, compareQRcode } = require("../../utils/qrcode");
const { Op } = require("sequelize");
const { UploadFile, getURL } = require("../../firebaseConfig");
const { faculty, floor, classroom, location } = require("../../models");
const catchAsync = require("../../utils/catchAsync");
const { count } = require("firebase/firestore");
exports.addFaculty = catchAsync(async (req, res, next) => {
  try {
    const { facultyName, facultyNumber } = req.body;
    let { coordinates } = req.body;
    console.log(coordinates);
    const facultyId = await new Promise((resolve, reject) => {
      faculty
        .create({ facultyName, facultyNumber })
        .then((record) => resolve(record.id))
        .catch((err) => reject(err));
    });

    coordinates = coordinates.map((item) => ({
      lon: item.longitude,
      lat: item.latitude,
      facultyId,
    }));
    await location.bulkCreate(coordinates).then(() =>
      res
        .status(201)
        .json({
          status: "success",
          message: "added successfully",
        })
        .catch((err) => {
          throw err;
        })
    );
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError")
      res.status(409).json({
        status: "failed",
        message: "This floor is already added",
      });
    console.log(err);
    return res.status(500).json({
      status: "failed",
      message: "Internal Server Error",
    });
  }
});

exports.addFloor = catchAsync(async (req, res, next) => {
  const { name, reference } = req.body;
  //console.log(data);
  let status = false;
  const { facultyId } = req.params;

  try {
    const id = await new Promise(async (resolve, reject) => {
      floor
        .create({ name, reference, facultyId })
        .then((record) => {
          status = true;
          resolve(record.id);
        })
        .catch((err) => {
          //  console.log(err);
          if (err.name === "SequelizeUniqueConstraintError") {
            return res.status(409).json({
              status: "failed",
              message: "already added",
            });
          } else reject(err);
        });
    });
    const facultyNumber = await new Promise(async (resolve, reject) => {
      faculty
        .findOne({ where: { id: facultyId }, attributes: ["facultyNumber"] })
        .then((record) => {
          resolve(record.facultyNumber);
        })
        .catch((err) => reject(err));
    });
    const data = { facultyNumber, reference, name };

    //if (status) await addFacultyFLoors(data, id, res, next);
    const URL = await getQRcode(JSON.stringify(data));
    const file = Buffer.from(URL, "base64");

    const nameImage = `/qrcode/${id}_${facultyId}.png`;
    const metadata = {
      contentType: "image/png",
    };
    await UploadFile(file, nameImage, metadata);
    const image = await getURL(nameImage);
    await floor
      .update({ image }, { where: { id, facultyId } })
      .then((count) => {
        if (count[0] === 1)
          return res.status(201).json({
            status: "success",
            message: "added successfully",
            id,
          });
        else
          return res.status(500).json({
            status: "faliled",
            message: "Internal Server Error",
          });
      })
      .catch((error) => {
        throw error;
      });
  } catch (err) {
    console.log("My error occurred", err);
    return res.status(500).json({
      status: "faliled",
      message: "Internal Server Error",
    });
  }
});
exports.addClassRoom = async (req, res) => {
  const data = req.body;
  let status = false;
  const { floorId } = req.params;
  try {
    const id = await new Promise((resolve, reject) => {
      classroom
        .create({ ...data, floorId })
        .then((record) => {
          status = true;
          resolve(record.id);
        })
        .catch((err) => {
          console.log(err);
          if (err.name === "SequelizeUniqueConstraintError") {
            res.status(409).json({
              status: "failed",
              message: "already added",
            });
          } else reject(err);
        });
    });
    console.log(id);

    res.status(201).json({
      status: "success",
      message: "added successfully",
      id,
    });
  } catch (err) {
    console.log("My error occurred", err);
    return res.status(500).json({
      status: "faliled",
      message: "Internal Server Error",
    });
  }
};
exports.editFaculty = async (req, res) => {
  try {
    const facultyId = parseInt(req.params.facultyId);
    const { facultyNumber, facultyName, coordinates } = req.body;
    const facultyData = { facultyNumber, facultyName };
    const count = await new Promise((resolve, reject) => {
      faculty
        .update(facultyData, { where: { id: facultyId } })
        .then((count) => {
          resolve(count[0]);
        })
        .catch((err) => reject(err));
    });
    if (count === 1) {
      console.log(coordinates);
      let newCoordinates = [];
      let count = 0;
      coordinates.map(async (coord) => {
        const { id } = coord;
        if (id)
          await location.update(coord, { where: { id } }).then((count) => {
            console.log("location count=", count);
            if (count[0] === 1) count++;
          });
        else {
          newCoordinates.push({ ...coord, facultyId });
        }
      });
      location
        .bulkCreate(newCoordinates)
        .then((result) => {
          console.log("location result=", result);
        })
        .catch((err) => {
          throw err;
        });
      return res.status(200).json({
        status: "success",
        message: "updated successfully",
      });
    } else if (count === 0)
      return res.status(404).json({
        status: "failed",
        message: "not found",
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
exports.deleteFaculty = async (req, res) => {
  try {
    const { facultyId } = req.params;
    const count = await new Promise((resolve, reject) => {
      location
        .destroy({ where: { facultyId } })
        .then((count) => {
          resolve(count);
        })
        .catch((err) => {
          reject(err);
        });
    });
    if (count >= 1) {
      await floor.destroy({ where: { facultyId } });
      faculty.destroy({ where: { id: facultyId } }).then((count) => {
        if (count === 0) return res.status(404).json({ status: "not found" });
        else return res.status(204).json({ status: "success" });
      });
    } else if (count === 0)
      return res.status(404).json({ status: "not found" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "faliled",
      message: "Internal Server Error",
    });
  }
};
exports.deleteFloor = async (req, res) => {
  try {
    const { floorId } = req.params;
    await classroom
      .destroy({ where: { floorId } })
      .then()
      .catch((err) => {
        throw err;
      });
    await floor
      .destroy({ where: { id: floorId } })
      .then((count) => {
        if (count === 1) return res.status(204).json({ status: "success" });
        else
          return res.status(404).json({
            status: "failed",
            message: "not found",
          });
      })
      .catch((err) => {
        throw err;
      });
    //return res.status(204).json({ status: "success" });
  } catch (err) {
    return res.status(500).json({
      status: "failed",
      message: "Internal Server Error",
    });
  }
};

exports.getFaculties = async (_, res) => {
  try {
    const data = await new Promise((resolve, reject) => {
      faculty
        .findAll({
          attributes: ["facultyName", "facultyNumber", "id"],
          include: [
            {
              model: location,
              attributes: ["lat", "lon", "id"],
            },
          ],
        })
        .then((record) => {
          resolve(record);
        })
        .catch((err) => reject(err));
    });
    console.log(data);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      status: "failed",
      message: "Internal Server Error",
    });
  }
};
exports.getFloors = async (req, res) => {
  const { facultyId } = req.params;
  try {
    let data = await new Promise((resolve, reject) => {
      faculty
        .findOne({
          attributes: ["facultyName"],
          where: { id: facultyId },
          include: [
            {
              model: floor,
              attributes: ["name", "id", "reference"],
            },
          ],
        })
        .then((record) => {
          resolve(record);
        })
        .catch((err) => reject(err));
    });
    if (!data) return res.status(404).json({ message: "not found" });
    /*let { floors } = data;
    floors = floors.map((floor) => ({
      name: floor.name,
      id: floor.id,
      reference: floor.facultyFloor.reference,
    }));
    
    //data = { ...data, floors };
    data = { ...data.get(), floors };*/
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      status: "failed",
      message: "Internal Server Error",
    });
  }
};
exports.getClasses = async (req, res) => {
  try {
    //const id = parseInt(req.params.floorId);
    const { facultyId, floorId } = req.params;
    console.log("params: facultyId=", facultyId, "floorId=", floorId);
    let data = await new Promise((resolve, reject) => {
      classroom
        .findAll({
          attributes: ["id", "number"],
          where: { floorId },
          include: [
            {
              model: floor,
              attributes: ["id"],
              include: [
                {
                  model: faculty,
                  where: { id: floorId },
                  attributes: ["facultyName"],
                  where: { id: facultyId },
                },
              ],
            },
          ],
        })
        .then((record) => {
          resolve(record);
        })
        .catch((err) => reject(err));
    });
    if (!data || data.length === 0) {
      return res.status(200).json({ classrooms: [], facultyName: "" });
    }
    const {
      floor: {
        faculty: { facultyName },
      },
    } = data[0];

    data = data.map((item) => ({
      id: item.id,
      number: item.number,
    }));

    return res.status(200).json({ classrooms: data, facultyName });
  } catch (err) {
    return res.status(500).json({
      status: "failed",
      message: "Internal Server Error",
    });
  }
};
exports.deleteClasses = async (req, res) => {
  try {
    const { classId } = req.params;
    await classroom
      .destroy({ where: { id: classId } })
      .then((count) => {
        if (count === 1) return res.status(204).json({ status: "success" });
        else
          return res.status(404).json({
            status: "failed",
            message: "not found",
          });
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    return res.status(500).json({
      status: "failed",
      message: "Internal Server Error",
    });
  }
};
