const multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
  destination: "./images/uploads",
  filename: (req, file, cb) => {
    return cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});
exports.upload = multer({ storage });
