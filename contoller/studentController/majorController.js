const { major, catigory, faculty } = require("../../models");
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
exports.getLocation = catchAsync(async (req, res) => {
  const { myLoc, goalLoc } = req.body;
  const facultyNumber1 = myLoc.slice(0, 2);
  const facultyNumber2 = goalLoc.slice(0, 2);
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
  if (facultyNumber1 !== facultyNumber2)
    return res.status(200).json({
      message: `please go to ${facultyname}`,
    });
  let floorNumber1 = myLoc.slice(2, 4);
  let floorNumber2 = goalLoc.slice(2, 4);
  if (floorNumber1 !== floorNumber2) {
    floorNumber1 =
      floorNumber1 === "G"
        ? 0
        : floorNumber1 === "B1"
          ? -1
          : floorNumber1 === "B2"
            ? -2
            : floorNumber1;
    floorNumber2 =
      floorNumber2 === "G"
        ? 0
        : floorNumber2 === "B1"
          ? -1
          : floorNumber2 === "B2"
            ? -2
            : floorNumber2;
    return res.status(200).json({
      message: `please go ${floorNumber1 - floorNumber2}floors`,
    });
  }
  let classNumber1 = myLoc.slice(4, myLoc.lenght);
  let classNumber2 = goalLoc.slice(4, goalLoc.lenght);
  if (classNumber1 !== classNumber2) {
    return res.status(200).json({
      message: `please go ${(classNumber1 - classNumber2) / 10}classes`,
    });
  }
  return res.status(200).json({
    message: `you are in right location`,
  });
});
