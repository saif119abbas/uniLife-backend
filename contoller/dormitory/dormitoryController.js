const AppError = require("../../utils/appError");
const { dormitoryOwner, dormitoryPost, user, room } = require("../../models");
const { addDocument } = require("../handelFactrory");
const catchAsync = require("../../utils/catchAsync");
exports.addDormitoryPost = catchAsync(async (req, res, next) => {
  const data = req.body;
  const userId = req.params.userId;
  const myUser = await dormitoryOwner.findOne({
    attributes: ["SSN"],
    where: { userId },
  });
  const dormitoryOwnerSSN = myUser.SSN;
  console.log("SSN", dormitoryOwnerSSN);
  const post = {
    descrption: data.description,
    location: data.location,
    dormitoryOwnerSSN,
  };
  let count = 0;
  const rooms = data.rooms;
  console.log("post", post);
  /* const result1 = await addDocument(dormitoryPost, post, res, next);
  const result = await new Promise(async (resolve, reject) => {
    try {
      const result = await addDocument(dormitoryPost, post, res, next);
      console.log("The result:", result);
      resolve(result);
    } catch (err) {
      console.log("The err", err);
      reject(new AppError("An error occurred please try again", 500));
    }
  });
  console.log("The result was", result1);
  res.status(201).json({ result });*/
  await dormitoryPost
    .create(post)
    .then((record) => {
      console.log("My record", record);
      rooms.map((myRoom) => {
        console.log("My room", myRoom);
        const roomData = {
          ...myRoom,
          dormitoryPostId: record.id,
        };

        room
          .create(roomData)
          .then(() => {})
          .catch((err) => {
            console.log("Error creating", err);
            if (err.name === "SequelizeUniqueConstraintError")
              return result.status(401).json({
                status: "failed",
                message: "This room is already created ",
              });
            else
              return next(
                new AppError("An error occurred please try again", 500)
              );
          });
        count++;
      });
    })
    .catch((err) => {
      console.log("My error####", err);
      if (err)
        return next(new AppError("An error occurred please try again", 500));
    });
  if (count === rooms.length)
    return res
      .status(201)
      .json({ status: "success", message: "created Successfuly" });
  else
    return res
      .status(400)
      .json({ status: "failed", message: "An error occured please try again" });
});
exports.deleteDormitoryPost = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  const id = req.params.dorimtoryPostid;
  let numberOfRoom = 0;
  await room.findAll({ where: { dormitoryPostId: id } }).then((record) => {
    numberOfRoom = record.length;
  });
  await room
    .destroy({ where: { dormitoryPostId: id } })
    .then((count) => {
      console.log(count);
      if (count === numberOfRoom) {
        dormitoryPost.destroy({ where: { id } }).then((count) => {
          if (count === 1)
            return res
              .status(204)
              .json({ status: "success", message: "deleted successfully" });
          else if (count > 1)
            return res
              .status(404)
              .json({ status: "failed", message: "not found" });
        });
      }
      if (count === 0)
        res.status(404).json({ status: "failed", message: "not found" });
    })
    .catch((err) => {
      return next(new AppError("An error occurred please try again", 500));
    });
});
