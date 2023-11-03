const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const crypto = require("crypto");
const OAuth2 = google.auth.OAuth2;
exports.createMessage = () =>
  crypto.randomBytes(3).toString("hex").toUpperCase();
exports.transportMessage = (
  myMessage,
  email,
  subject = "Verification Email"
) => {
  const oauth2Client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDICT_URL
  );
  oauth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

  const accessToken = oauth2Client.getAccessToken();

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      type: "OAuth2",
      user: process.env.USER,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
      accessToken: accessToken,
    },
  });
  const mailOptions = {
    from: process.env.USER,
    to: email,
    subject,
    text: myMessage,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("error");
      console.log(error);
    } else {
      console.log("No error");
      while (!info.response.split(" ")[2] === "OK");

      console.log("Email sent: " + info.response);
    }
  });
  transporter.close();
};
