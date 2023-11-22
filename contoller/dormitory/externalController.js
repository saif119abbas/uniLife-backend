const AppError = require("../../utils/appError");
const { dormitoryOwner, dormitoryPost, room, user } = require("../../models");
const catchAsync = require("../../utils/catchAsync");
exports.getAllDormitoryPost = catchAsync(async (req, res, next) => {
  try {
    const dorimtoryPosts = await dormitoryPost.findAll({
      order: [["createdAt", "DESC"]],
    });
    let posts = [];
    if (!dorimtoryPosts)
      return res
        .status(404)
        .json({ status: "failed", message: "no post found" });
    console.log(dorimtoryPosts);

    for (const item of dorimtoryPosts) {
      console.log("THE ITEM:", item);
      const data = {
        id: "",
        username: "",
        email: "",
        phoneNum: "",
        description: "",
        location: "",
        room: [],
      };
      const myOwner = await dormitoryOwner.findOne({
        attributes: ["userId"],
        where: { SSN: item.dormitoryOwnerSSN },
      });
      if (!myOwner)
        return res
          .status(404)
          .json({ status: "failed", message: "no post found" });
      console.log("MyOwner: ", myOwner);
      const ownerUser = await user.findOne({
        attributes: ["username", "email", "phoneNum"],
        where: { id: myOwner.userId },
      });
      console.log("ownerUser: ", ownerUser);
      if (!ownerUser)
        return res
          .status(404)
          .json({ status: "failed", message: "no post found" });
      data.username = ownerUser.username;
      data.email = ownerUser.email;
      data.phoneNum = ownerUser.phoneNum;
      data.description = item.descrption;
      data.location = item.location;
      data.id = item.id;
      const rooms = await room.findAll({
        attributes: ["typeOfRoom", "rent", "numberOfPerson"],
        where: { dormitoryPostId: item.id },
      });
      if (!rooms) {
        return res
          .status(404)
          .json({ status: "failed", message: "no post found" });
      }
      let roomsData = [];
      for (const myRoom of rooms) {
        const roomData = { typeOfRoom: "", rent: "", numberOfPerson: "" };
        roomData.typeOfRoom = myRoom.typeOfRoom;
        roomData.rent = myRoom.rent;
        roomData.numberOfPerson = myRoom.numberOfPerson;
        roomsData.push(roomData);
      }
      data.room = roomsData;
      posts.push(data);
    }
    res.status(200).json({ posts });
  } catch (err) {
    console.log("Myerr", err);
    return next(new AppError("An error occurred please try again", 500));
  }
});
exports.getPost = catchAsync(async (req, res, next) => {
  try {
    const dorimtoryId = req.params.dorimtoryId;
    const dorimtoryPosts = await dormitoryPost.findOne({
      where: { id: dorimtoryId },
      order: [["createdAt", "DESC"]],
    });
    let data = {
      id: "",
      username: "",
      email: "",
      phoneNum: "",
      description: "",
      location: "",
      room: [],
    };
    if (!dorimtoryPosts)
      return res
        .status(404)
        .json({ status: "failed", message: "no post found" });
    console.log(dorimtoryPosts);

    console.log("THE ITEM:", dorimtoryPosts);

    const myOwner = await dormitoryOwner.findOne({
      attributes: ["userId"],
      where: { SSN: dorimtoryPosts.dormitoryOwnerSSN },
    });
    if (!myOwner)
      return res
        .status(404)
        .json({ status: "failed", message: "no post found" });
    console.log("MyOwner: ", myOwner);
    const ownerUser = await user.findOne({
      attributes: ["username", "email", "phoneNum"],
      where: { id: myOwner.userId },
    });
    console.log("ownerUser: ", ownerUser);
    if (!ownerUser)
      return res
        .status(404)
        .json({ status: "failed", message: "no post found" });
    data.username = ownerUser.username;
    data.email = ownerUser.email;
    data.phoneNum = ownerUser.phoneNum;
    data.description = dorimtoryPosts.descrption;
    data.location = dorimtoryPosts.location;
    data.id = dorimtoryPosts.id;
    const rooms = await room.findAll({
      attributes: ["typeOfRoom", "rent", "numberOfPerson"],
      where: { dormitoryPostId: dorimtoryPosts.id },
    });
    if (!rooms) {
      return res
        .status(404)
        .json({ status: "failed", message: "no post found" });
    }
    let roomsData = [];
    for (const myRoom of rooms) {
      const roomData = { typeOfRoom: "", rent: "", numberOfPerson: "" };
      roomData.typeOfRoom = myRoom.typeOfRoom;
      roomData.rent = myRoom.rent;
      roomData.numberOfPerson = myRoom.numberOfPerson;
      roomsData.push(roomData);
    }
    data.room = roomsData;
    res.status(200).json({ data });
  } catch (err) {
    console.log("Myerr", err);
    return next(new AppError("An error occurred please try again", 500));
  }
});
exports.getMyPosts = catchAsync(async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const myOwner = await dormitoryOwner.findOne({
      attributes: ["SSN"],
      where: { userId },
    });
    if (!myOwner)
      return res
        .status(404)
        .json({ status: "failed", message: "User not found" });
    const dormitoryOwnerSSN = myOwner.SSN;
    const myPosts = await dormitoryPost.findAll({
      attributes: ["id", "descrption", "location"],
      where: { dormitoryOwnerSSN },
      order: [["createdAt", "DESC"]],
    });
    if (!myPosts)
      return res
        .status(404)
        .json({ status: "failed", message: "you don't have any post" });
    let data = [];
    for (const myPost of myPosts) {
      const post = {
        id: "",
        description: "",
        location: "",
        rooms: [],
      };
      post.description = myPost.descrption;
      post.id = myPost.id;
      post.location = myPost.location;
      let rooms = [];
      const myRooms = await room.findAll({
        attributes: ["typeOfRoom", "rent", "numberOfPerson"],
        where: { dormitoryPostId: myPost.id },
      });
      for (const myRoom of myRooms) {
        rooms.push(myRoom);
      }
      post.rooms = rooms;
      data.push(post);
    }
    res.status(200).json({ data });
  } catch (err) {
    console.log("Myerr", err);
    return next(new AppError("An error occurred please try again", 500));
  }
});
