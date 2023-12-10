const multer = require("multer");
const path = require("path");
const storage = multer.memoryStorage(); /*multer.diskStorage({
  destination: "./images/uploads",
  filename: (req, file, cb) => {
    console.log("file in multur:", file);
    return cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});*/
exports.upload = multer({ storage });
