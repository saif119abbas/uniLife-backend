const FCM = require("fcm-node");
const serverKey = process.env.SERVER_KEY;
const fcm = new FCM(serverKey);
const to =
  "fZz9SkTQQh6ZpML7K6dB6Q:APA91bFSFjPcInDpiMdL23vtoS4ZmNI1QZH-vXizvKyd2LGknWd1MmKvRT8qAOx-M1hoVQ5riUflqiZ4DzdXnmUUbi76XfaXKkx-CL0-Tfqquy9nQQ8MKpw_dbHlCNRKwQQ5AJQPRUQ0";
exports.pushNotification = async () => {
  console.log("serverKey:", serverKey);
  const message = {
    notification: {
      title: "Your notification",
      body: "have message",
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
