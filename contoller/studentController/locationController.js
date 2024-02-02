const { faculty, floor, classroom } = require("../../models");
const catchAsync = require("../../utils/catchAsync");
const { Op } = require("sequelize");
exports.getLocation = catchAsync(async (req, res) => {
  try {
    console.log(req.query);
    let { myLoc, goalLoc } = req.query;
    console.log(myLoc, goalLoc);
    myLoc = JSON.parse(myLoc);
    let currFacultyNumber = parseInt(myLoc.facultyNumber);
    let currClass = parseInt(myLoc.reference);
    let currFloor = myLoc.name;

    let toFaculty = parseInt(goalLoc.faculty);
    let toFloor = goalLoc.floor;
    let toClass = parseInt(goalLoc.classNum);
    console.log(myLoc);
    if (!toFaculty || !toFloor || !toClass) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid QR Code",
      });
    }
    const floorId = await new Promise((resolve, reject) => {
      faculty
        .findOne({
          where: { facultyNumber: toFaculty },
          attributes: ["id"],
          include: [
            {
              model: floor,
              attributes: ["id"],
              where: { name: toFloor },
              include: [
                {
                  model: classroom,
                  attributes: ["id"],
                  where: { number: toClass },
                },
              ],
            },
          ],
        })
        .then((record) => {
          /*const floorId = record.floors[0].id;
          const classrooms = record.floors[0].classrooms;
          const data = {
            floorId,
            classrooms,
          };*/
          if (record) resolve(record.floors[0].id);
          else resolve(false);
        })
        .catch((err) => reject(err));
    });
    if (!floorId)
      return res.status(400).json({
        status: "failed",
        message: "Invalid Class Number",
      });
    /* if (myLoc === goalLoc)
      return res.status(200).json({
        status: "success",
        message: "you are in right location",
      });*/
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
    const currFacultyName = await new Promise((resolve, reject) => {
      faculty
        .findOne({
          where: { facultyNumber: currFacultyNumber },
          attributes: ["facultyName"],
        })
        .then((record) => {
          if (record) resolve(record.facultyName);
          else {
            console.log("Gg");
          }
        });
    });
    const data = {
      upDown: 0,
      rightLeft: 0,
      currFac: "",
      nextFac: "",
    };
    data.currFac = currFacultyName;
    if (currFacultyNumber !== toFaculty) {
      const toFacultyName = await new Promise((resolve, reject) => {
        faculty
          .findOne({
            where: { facultyNumber: toFaculty },
            attributes: ["facultyName"],
          })
          .then((record) => {
            if (record) resolve(record.facultyName);
            else {
              console.log("Gg");
            }
          });
      });

      data.nextFac = `${toFacultyName}`;
      console.log(data.faculty);
      return res.status(200).json(data);
    }
    console.log("GG");
    const name = toFloor;
    if (currFloor !== toFloor) {
      console.log("floors", currFloor, toFloor);
      const floorId = await new Promise((resolve, reject) => {
        floor
          .findOne({ where: { name: toFloor }, attributes: ["id"] })
          .then((record) => {
            if (record) resolve(record.id);
            else resolve(false);
          })
          .catch((err) => reject(err));
      });
      if (!floorId)
        return res.status(400).json({
          status: "failed",
          message: " Invalid Destination Class Number",
        });
      toFloor = formatFloor(toFloor);
      currFloor = formatFloor(currFloor);
      data.upDown = toFloor - currFloor;
      console.log(data);
      return res.status(200).json(data);
    }
    if (currClass === toClass)
      return res.status(200).json({
        status: "success",
        message: "you are in right location",
      });

    const dir = toClass > currClass ? 1 : -1;
    console.log(currClass, toClass);
    let condition =
      toClass > currClass
        ? {
            number: {
              [Op.gt]: parseInt(currClass),
              [Op.lt]: parseInt(toClass),
            },
          }
        : {
            number: {
              [Op.lt]: parseInt(currClass),
              [Op.gt]: parseInt(toClass),
            },
          };
    condition = { ...condition, floorId };
    console.log("Hello", floorId);
    const classrooms = await new Promise((resolve) => {
      classroom
        .findAll({
          where: condition,
          attributes: ["number"],
        })
        .then((record) => {
          if (record) resolve(record);
        });
    });
    console.log(classrooms);
    data.rightLeft = dir * (classrooms.length + 1);
    console.log(data);
    return res.status(200).json(data);
  } catch (err) {
    console.log("err:", err);
    return res.status(500).json({
      status: "failed",
      message: "Internal Server Error",
    });
  }
});
const formatFloor = (floorNumber) => {
  console.log("floor:", floorNumber);
  console.log("floor[0]:", floorNumber.charAt(0));
  if (floorNumber === "G") return 0;
  else if (floorNumber.charAt(0) === B)
    return -1 * parseInt(floorNumber.charAt(1));
  else return parseInt(floorNumber);
};
