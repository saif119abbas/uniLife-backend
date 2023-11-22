const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.addDocument = catchAsync(async (modle, myData, res, next = null) => {
  const result = await new Promise(async (resolve, reject) => {
    let myJson = { status: "", message: "" };

    try {
      console.log("MY DATA: ", myData);
      await modle.create(myData);
      myJson.status = "success";
      myJson.message = "created successfully";
      resolve(myJson);
    } catch (err) {
      console.log("Error creating", err);
      if (err.name === "SequelizeUniqueConstraintError") {
        myJson.status = "failed";
        myJson.message = "already created";
        resolve(myJson);
      } else {
        reject(new AppError("An error occurred please try again", 500));
      }
    }
  });
  return result;
});
