const admin = require("firebase-admin");
const request = require("request");
const fs = require("fs");

// Initialize Firebase Admin SDK
const serviceAccount = require("path/to/your/serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "your-firebase-storage-bucket-url.appspot.com",
});

// Reference to the Firebase Storage bucket
const bucket = admin.storage().bucket();

// URL of the image in Firebase Storage
const imageUrl =
  "https://firebasestorage.googleapis.com/v0/b/unilife-1b22d.appspot.com/o/images%2Fdrawing%20tools%2F101.jpg_12?alt=media&token=cec23341-4eb8-45ab-8718-9c209c068d7e";

// Specify the local path where you want to save the downloaded image
const localFilePath = "/images/uploads/image.jpg";

// Create a writable stream to save the image locally
const fileStream = fs.createWriteStream(localFilePath);

// Download the image from the Firebase Storage URL
request(imageUrl)
  .pipe(fileStream)
  .on("finish", () => {
    console.log("Image downloaded successfully.");
  })
  .on("error", (err) => {
    console.error("Error downloading image:", err);
  });
