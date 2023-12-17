const QRCode = require("qrcode");
const Jimp = require("jimp");
const qrCodeReader = require("qrcode-reader");
exports.createQRcode = (value) => {
  QRCode.toString(
    value,
    {
      errorCorrectionLevel: "H",
      type: "terminal",
    },
    function (err, data) {
      if (err) throw err;
      console.log(data);
    }
  );
};
exports.getQRcode = async (value) => {
  let URL = await new Promise((resolve, reject) => {
    QRCode.toDataURL(value, (err, url) => {
      if (err) reject(err);
      else resolve(url);
    });
  });
  URL = URL.split(";base64,").pop();
  console.log("URL: ", URL);
  return URL;
};
exports.createImage = (value) => {
  const image = QRCode.toFile("qr.png", value, function (err, data) {
    if (err) throw err;
    return data;
  });
  console.log("qr.png created", image);
};
exports.compareQRcide = (buffer, value) => {};
