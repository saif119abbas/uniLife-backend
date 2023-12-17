const { Op, where } = require("sequelize");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const { UploadFile, getURL, deleteFile } = require("../../firebaseConfig");
const { intersection } = require("../../utils/arrayActions");
const {
  student,
  user,
  catigory,
  major,
  post,
  postMajor,
} = require("../../models");
const addMajors = async (data, res, next) => {
  const { majors, postId } = data;
  for (const name of majors) {
    try {
      const majorId = await new Promise((resolve, reject) => {
        major
          .findOne({ attributes: ["id"], where: { name } })
          .then((record) => {
            console.log("The major id", record.id);
            if (record.id) {
              console.log("Found");
              resolve(record.id);
            } else
              reject(new AppError("An error occurred please try again", 500));
          });
      });
      console.log("next:", majorId);
      const Item = { majorId, postId };
      await postMajor.create(Item);
    } catch (err) {
      console.log("The err", err);
      return next(new AppError("An error occurred please try again", 500));
    }
  }
};
const editMajors = async (data, res, next) => {
  const { majors, postId } = data;
  try {
    await postMajor.destroy({
      where: { postId },
    });
    for (const name of majors) {
      const majorId = await new Promise((resolve, reject) => {
        major
          .findOne({ attributes: ["id"], where: { name } })
          .then((record) => {
            console.log("The major id", record.id);
            if (record.id) {
              console.log("Found");
              resolve(record.id);
            } else
              reject(new AppError("An error occurred please try again", 500));
          });
      });
      await postMajor.create({ postId, majorId }).then();
    }
  } catch (err) {
    console.log("The err", err);
    return next(new AppError("An error occurred please try again", 500));
  }
};
exports.createPost = catchAsync(async (req, res, next) => {
  console.log("The body:", req.body.data);

  try {
    const data = JSON.parse(req.body.data);
    const userId = req.params.userId;

    // Assuming you have the necessary Sequelize models defined
    const myStudent = await student.findOne({
      attributes: ["id"],
      where: { userId },
    });

    const studentId = myStudent.id;
    console.log("req.file:", req.file); // Correctly log the uploaded file

    const catigoryId = await new Promise((resolve, reject) => {
      catigory
        .findOne({ attributes: ["id"], where: { name: data.catigory } })
        .then((record) => {
          if (!record || record.length === 0)
            return res.status(404).json({
              status: "failed",
              message: "this catigory is not found",
            });
          resolve(record.id);
        });
    });
    const file = req.file;

    const postData = {
      description: data.description,
      studentId,
      catigoryId,
    };
    const id = await new Promise((resolve, reject) => {
      post.create(postData).then((record) => {
        const majors = data.majors;
        // catigory.create({ postId: record.id, name: data.catigory });
        addMajors({ majors, postId: record.id }, res, next);
        resolve(record.id);
      });
    });
    const nameImage = `/student post/${id}`;

    await UploadFile(file.buffer, nameImage);
    const image = await getURL(nameImage);
    await post.update({ image }, { where: { id } });
    res.status(201).json({
      status: "success",
      message: "Post created successfully",
      // Include any additional data you want to send back
    });
  } catch (error) {
    console.error("Error creating post:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        status: "failed",
        message: "Already created",
      });
    }

    return next(new AppError("An error occurred, please try again", 500));
  }
});
exports.editPost = catchAsync(async (req, res, next) => {
  console.log("The body:", req.body.data);

  try {
    const data = JSON.parse(req.body.data);
    const userId = req.params.userId;
    const id = req.params.postId;
    const myStudent = await student.findOne({
      attributes: ["id"],
      where: { userId },
    });

    const studentId = myStudent.id;
    let postData = {};
    console.log("req.file:", req.file); // Correctly log the uploaded file
    let catigoryId = "";
    if (data.catigory) {
      catigoryId = await new Promise((resolve, reject) => {
        catigory
          .findOne({ attributes: ["id"], where: { name: data.catigory } })
          .then((record) => {
            if (!record || record.length === 0)
              return res.status(404).json({
                status: "failed",
                message: "this catigory is not found",
              });
            resolve(record.id);
          });
      });
      postData.catigory = catigoryId;
    }
    let image = "";
    const file = req.file;
    if (file) {
      const nameImage = `/student post/${id}`;
      await UploadFile(file, nameImage);
      image = await getURL(nameImage);
      postData.image = image;
    }
    if (data.description) postData.description = data.description;
    await post.update(postData, { where: { id, studentId } }).then((count) => {
      if (count[0] === 1) {
        if (data.majors)
          editMajors({ majors: data.majors, postId: id }, res, next);
        res.status(200).json({
          status: "success",
          message: "Post updated successfully",
          // Include any additional data you want to send back
        });
      } else if (count[0] === 0)
        res.status(404).json({
          status: "failed",
          message: "not found1111",
          // Include any additional data you want to send back
        });
    });
  } catch (error) {
    console.error("Error creating post:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        status: "failed",
        message: "Already created",
      });
    }

    return next(new AppError("An error occurred, please try again", 500));
  }
});
exports.deletePost = catchAsync(async (req, res, next) => {
  try {
    const { userId, postId } = req.params;

    const myStudent = await student.findOne({
      attributes: ["id"],
      where: { userId },
    });

    const studentId = myStudent.id;
    const image = await new Promise((resolve, reject) => {
      post.findOne({ where: { id: postId, studentId } }).then((res) => {
        if (res) resolve(res.image);
      });
    });
    const baseUrl = image.split("?")[0].split("/");
    const path = baseUrl[baseUrl.length - 1].split("%2F");
    const nameImage = `student post/${path[path.length - 1]}`;
    const deleteCount = await new Promise((resolve, _) => {
      post.destroy({ where: { id: postId, studentId } }).then((deleteCount) => {
        resolve(deleteCount);
      });
    });
    if (deleteCount === 1) {
      await deleteFile(nameImage);
      return res.status(204).json({});
    } else
      return res.status(404).json({
        status: "failed",
        message: "not found",
      });
  } catch (error) {
    console.error("Error creating post:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        status: "failed",
        message: "Already created",
      });
    }

    return next(new AppError("An error occurred, please try again", 500));
  }
});
exports.getPostStudent = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  const pageNumber = req.params.pageNumber;
  // const pageSize = req.params.pageSize;
  const studentId = await new Promise((resolve, reject) => {
    student
      .findOne({ attributes: ["id"], where: { userId } })
      .then((record) => {
        if (record.id) resolve(record.id);
        else
          res.status(400).json({
            status: "failed",
            message: "not found user",
          });
      });
  });
  // console.log("body", req.body);
  const { myCatigory, myMajor } = req.body;
  let condition = { studentId: { [Op.not]: studentId } };
  console.log(myCatigory, myMajor);
  let ids = [];
  if (myCatigory) {
    const catigoryId = await new Promise((resolve, reject) => {
      catigory
        .findOne({
          attributes: ["id"],
          where: { name: myCatigory },
        })
        .then((record) => {
          if (record.id) resolve(record.id);
        });
    });
    if (catigoryId) condition = { ...condition, catigoryId };
  }
  if (myMajor) {
    const majors = await major.findAll({
      attributes: ["id"],
      where: { name: myMajor },
    });
    const majorsId = majors.map((item) => item.id);
    const Items = await postMajor.findAll({
      attributes: ["postId"],
      where: { majorId: { [Op.in]: majorsId } },
    });
    ids = Items.map((item) => item.postId);
    condition = { ...condition, id: { [Op.in]: ids } };
  }
  console.log("ids", ids);
  const posts = await post.findAll({
    where: condition,
    attributes: ["id", "studentId", "image", "description"],
    include: [
      {
        model: student,
        include: [
          {
            model: user,
            attributes: ["username"],
          },
        ],
        attributes: ["userId"],
      },
    ],
    offset: (pageNumber - 1) * 2,
    limit: 2,
  });
  if (!posts || posts.length === 0)
    return res.status(404).json({
      status: "failed",
      message: "there is no post",
    });
  const data = posts.map((post) => {
    return {
      id: post.id,
      description: post.description,
      image: post.image,
      studentId: post.id,
      username: post.student.user.username,
    };
  });
  res.status(200).json({ data });
});
exports.reservesdPost = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  const myStudent = await student.findOne({
    attributes: ["blocked", "id"],
    where: { userId },
  });
  if (myStudent.blocked)
    return res.status(403).json({
      status: "failed",
      message: "you are blocked, you can't reserved post",
    });
  const reservedBy = myStudent.id;
  const id = req.params.postId;
  await post
    .update(
      { reservedBy },
      { where: { reservedBy: null, id, studentId: { [Op.not]: myStudent.id } } }
    )
    .then((count) => {
      if (count[0] === 1)
        return res
          .status(200)
          .json({ status: "success", message: "reserved successfully" });
      else if (count[0] === 0)
        return res.status(404).json({
          status: "failed",
          message: "not found post",
        });
    });
});
exports.unReservesdPost = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  const myStudent = await student.findOne({
    attributes: ["blocked", "id"],
    where: { userId },
  });
  if (!myStudent)
    return res.status(403).json({
      status: "failed",
      message: "you are not student",
    });
  if (myStudent.blocked)
    return res.status(403).json({
      status: "failed",
      message: "you are blocked, you can't reserved post",
    });
  const studentId = myStudent.id;
  const id = req.params.postId;
  await post
    .update(
      { reservedBy: null },
      { where: { [Op.or]: [{ reservedBy: studentId }, { studentId }], id } }
    )
    .then((count) => {
      if (count[0] === 1)
        return res
          .status(200)
          .json({ status: "success", message: "reserved canceled" });
      else if (count[0] === 0)
        return res.status(404).json({
          status: "failed",
          message: "not found post or you this item not reserved",
        });
    })
    .catch((err) => {
      console.log("my error: ", err);
      return next(new AppError("An error occurred please try again", 500));
    });
});
exports.searchPost = catchAsync(async (req, res, next) => {
  const desc = req.body.description;
  const userId = req.params.userId;
  const myStudent = await student.findOne({
    attributes: ["id", "blocked"],
    where: { userId },
  });
  const posts = await post.findAll({
    where: {
      description: { [Op.like]: `%${desc}%` },
      studentId: { [Op.not]: myStudent.id },
    },
    include: [
      {
        model: student,
        include: [
          {
            model: user,
            attributes: ["username"],
          },
        ],
        attributes: ["userId"],
      },
    ],
  });
  if (!posts || posts.length === 0)
    return res.status(404).json({ message: "no post found" });
  /*if (myStudent.blocked)
    return res.status(403).json({
      status: "failed",
      message:"not allowed"
    })*/
  const data = posts.map((post) => {
    return {
      id: post.id,
      description: post.description,
      image: post.image,
      studentId: post.id,
      username: post.student.user.username,
    };
  });
  res.status(200).json({ data });
});

exports.getMyPost = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  const studentId = await new Promise((resolve, reject) => {
    student
      .findOne({
        attributes: ["id"],
        where: {
          userId,
        },
      })
      .then((record) => {
        if (record) resolve(record.id);
      });
  });
  console.log("studentId", studentId);
  const posts = await new Promise((resolve, reject) => {
    post
      .findAll({
        attributes: ["id", "reservedBy", "image", "description"],
        where: { studentId },
      })
      .then((record) => {
        if (record) resolve(record);
        else
          return res.status(404).json({
            status: "failed",
            message: "no post found",
          });
      });
  });
  let data = [];
  for (const post of posts) {
    const reservedBy = post.reservedBy;
    let username = "";
    if (reservedBy) {
      console.log(reservedBy);
      console.log(post.id);
      username = await new Promise((resolve, reject) => {
        student
          .findOne({
            attributes: ["userId"],
            where: { id: reservedBy },
            include: { model: user, attributes: ["username"] },
          })
          .then((record) => {
            if (record) resolve(record.user.username);
          });
      });
      console.log(username);
      /* username = await new Promise((resolve, reject) => {
        user
          .findOne({ attributes: ["username"], where: { id } })
          .then((record) => {
            if (record) resolve(record.username);
          });
      });*/
    }
    data.push({
      id: post.id,
      username,
      reservedBy,
      image: post.image,
      description: post.description,
    });
  }
  if (data.length > 0)
    return res.status(200).json({
      data,
    });
  else
    return res.status(404).json({
      status: "failed",
      message: "no post found",
    });
});
