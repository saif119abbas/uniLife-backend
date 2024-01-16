const FCM = require("fcm-node");
const serverKey = process.env.SERVER_KEY;
const fcm = new FCM(serverKey);
exports.pushNotification = async (to, title, body) => {
  console.log("serverKey:", serverKey);
  const message = {
    notification: {
      title,
      body,
    },
    to,
  };

  fcm.send(message, function (err, response) {
    if (err) {
      console.error("error sending message :", err);
    } else {
      console.log("Successfully sent ", response);
      return response.success;
    }
  });
};
