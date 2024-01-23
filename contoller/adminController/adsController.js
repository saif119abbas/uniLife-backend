const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const { ads } = require("../../models");
const { Op, Sequelize, QueryTypes } = require("sequelize");
const databaseName = require("../../databaseName");
const { UploadFile, getURL } = require("../../firebaseConfig");
const cron = require("node-cron");
exports.addAds = async (req, res) => {
  try {
    console.log(req.body.data);
    const data = JSON.parse(req.body.data);
    const file = req.file;
    const id = await new Promise((resolve, reject) => {
      ads
        .create(data)
        .then((record) => {
          resolve(record.id);
        })
        .catch((err) => {
          reject(err);
        });
    });

    const nameImage = `/adds/${id}`;
    console.log(file);
    await UploadFile(file.buffer, nameImage);
    const image = await getURL(nameImage);
    console.log(image);
    await ads
      .update({ image }, { where: { id } })
      .then(([count]) => {
        return res.status(200).json({
          status: "success",
          message: "created successfully",
        });
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "failes",
      message: "Internal Server Error",
    });
  }
};
exports.getAdds = async (req, res) => {
  try {
    const data = await new Promise((resolve, reject) => {
      ads
        .findAll({
          where: { isActive: true },
          attributes: ["id", "title", "description", "image"],
        })
        .then((record) => {
          resolve(record);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      status: "failes",
      message: "Internal Server Error",
    });
  }
};
cron.schedule("*/60 * * * * *", async () => {
  try {
    const data = await new Promise((resolve, reject) => {
      ads
        .findAll({
          attributes: ["id", "title", "description", "image", "isActive"],
          order: [["id", "ASC"]],
        })
        .then((results) => resolve(results))
        .catch((err) => reject(err));
    });
    if (data.length === 1)
      await ads.update({ isActive: true }, { where: { id: data[0].id } });
    else {
      let currentId, nextId;
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (item.isActive) {
          console.log(item.id);
          currentId = item.id;
          if (i === data.length - 1) nextId = data[0].id;
          else nextId = data[i + 1].id;
          break;
        }
      }
      console.log(currentId, nextId);
      await ads.update({ isActive: false }, { where: { id: currentId } });
      await ads.update({ isActive: true }, { where: { id: nextId } });
    }
  } catch (err) {}
});
