const { faculty, floor, classroom } = require("../../models");
const catchAsync = require("../../utils/catchAsync");
const { Op } = require("sequelize");
exports.getLocation = catchAsync(async (req, res) => {
  try {
    const { myLoc, goalLoc } = req.body;
    if (myLoc === goalLoc)
      return res.status(200).json({
        status: "success",
        message: "you are in right location",
      });
    /* const currentTime = new Date().toLocaleTimeString("en-US", {
      hour12: false,
    });
   const goalLoc = await new Promise((resolve) => {
      lecture
        .findOne({
          attributes: ["classNumber"],
          where: {
            startTime: { [Op.gte]: currentTime },
          },
          include: [
            {
              model: schedule,
              attributes: [],
              include: [
                {
                  model: student,
                  attributes: [],
                  where: { userId },
                },
              ],
            },
          ],
        })
        .then((record) => {
          if (record) resolve(record.classNumber);
        });
    });*/

    const facultyNumber1 = myLoc.slice(0, 2);
    const facultyNumber2 = goalLoc.slice(0, 2);
    const data = {
      upDown: 0,
      rightLeft: 0,
      faculty: "",
    };
    if (facultyNumber1 !== facultyNumber2) {
      const facultyname = await new Promise((resolve, reject) => {
        faculty
          .findOne({
            where: { facultyNumber: facultyNumber2 },
            attributes: ["name"],
          })
          .then((record) => {
            if (record) resolve(record.name);
          });
      });
      data.faculty = facultyname;
      return res.status(200).json({
        data,
      });
    }
    let index1 = myLoc.includes("B1") || myLoc.includes("B2") ? 4 : 3;
    let index2 = goalLoc.includes("B1") || myLoc.includes("B2") ? 4 : 3;
    let floorNumber1 = myLoc.slice(2, index1);
    let floorNumber2 = goalLoc.slice(2, index2);

    if (floorNumber1 !== floorNumber2) {
      console.log("floors", floorNumber1, floorNumber2);
      floorNumber1 =
        floorNumber1 === "G0"
          ? 0
          : floorNumber1 === "B1"
            ? -1
            : floorNumber1 === "B2"
              ? -2
              : parseInt(floorNumber1);
      floorNumber2 =
        floorNumber2 === "G0"
          ? 0
          : floorNumber2 === "B1"
            ? -1
            : floorNumber2 === "B2"
              ? -2
              : parseInt(floorNumber2);
      data.upDown = floorNumber2 - floorNumber1;
      return res.status(200).json({
        data,
      });
    }
    let classNumber1 = myLoc.slice(index1, myLoc.lenght);
    let classNumber2 = goalLoc.slice(index2, goalLoc.lenght);
    if (classNumber1 === classNumber2)
      return res.status(200).json({
        status: "success",
        message: "you are in right location",
      });
    const dir = classNumber2 > classNumber1 ? -1 : 1;
    const condition =
      classNumber2 > classNumber1
        ? {
            number: {
              [Op.gt]: parseInt(classNumber1),
            },
          }
        : {
            number: {
              [Op.lt]: parseInt(classNumber1),
            },
          };
    console.log(classNumber1, classNumber2);
    const floorsInfo = await new Promise((resolve) => {
      faculty
        .findOne({
          where: { facultyNumber: facultyNumber1 },
          attributes: ["facultyNumber"],
          include: [
            {
              model: floor,
              attributes: ["id"],
              where: { name: floorNumber1 },
              include: [
                {
                  model: classroom,
                  where: condition,
                  attributes: ["number"],
                },
              ],
            },
          ],
        })
        .then((record) => {
          if (record) resolve(record);
        });
    });
    const floors = floorsInfo.floors[0];
    let { classrooms } = floors;
    data.rightLeft = dir * classrooms.length;
    return res.status(200).json({
      data,
    });
  } catch (err) {
    console.log("err:", err);
  }
});
