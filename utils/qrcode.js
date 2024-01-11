const QRCode = require("qrcode");
const Jimp = require("jimp");
const jsQR = require("jsqr");
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
exports.compareQRcode = async (buffer, URL = "") => {
  let storedQR = "";
  Jimp.read(buffer, (err, image) => {
    if (err) {
      console.log("qrcode error: ", err);
      throw err;
    }
    // __ Creating an instance of qrcode-reader __ \\

    const qrCodeInstance = new qrCodeReader();
    qrCodeInstance.callback = function (err, value) {
      console.log("here");
      if (err) {
        console.error(err);
        throw err;
      }
      // __ Printing the decrypted value __ \\
      console.log("value:", value.result);
      storedQR = value.result;
      //if (URL === value.result) console.log("They are equal");
    };

    // __ Decoding the QR code __ \\
    // qrCodeInstance.decode(image.bitmap);
  });
  return storedQR.id;
};
