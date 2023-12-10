const QRCode = require("qrcode");
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
exports.getQRcode = (value) => {
  let URL = "";
  QRCode.toDataURL(
    value,
    {
      errorCorrectionLevel: "H",
      type: "terminal",
    },
    function (err, data) {
      if (err) throw err;
      console.log(data);
      URL = data;
    }
  );
  return URL;
};
exports.createImage = (value) => {
  const image = QRCode.toFile("qr.png", value, function (err, data) {
    if (err) throw err;
    return data;
  });
  console.log("qr.png created", image);
};  
