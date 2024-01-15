const QRCode = require("qrcode");
const app = require("./app");
const dotenv = require("dotenv");
dotenv.config({ path: ".env" });
const db = require("./models");
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const { sendMessage, sendImage } = require("./SocketMethods/createMessage");
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:8081",
      "http://localhost:8082",
      "http://localhost:3001",
    ],
    methods: ["GET", "POST"],
  },
});

// Keep track of connected users and their rooms
const userSocketMap = {};
const restaurantSocketMap = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Handle user login
  socket.on("login", (userId) => {
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} logged in.`);
  });
  socket.on("restaurantLogin", (restaurantId) => {
    restaurantSocketMap[restaurantId] = socket.id;
    console.log(`Restaurant ${restaurantId} logged in.`);
  });

  socket.on("imageMessage", async ({ senderId, receiverId, image }) => {
    const receiverSocketId = userSocketMap[receiverId];
    const imageLink = await sendImage(senderId, receiverId, image);
    console.log(imageLink);
    if (receiverSocketId) {
      // Save the image to a file (you might want to use a database instead)
      const receiverSocketId = userSocketMap[receiverId];

      // Send the image path to the receiver
      io.to(receiverSocketId).emit("imageMessage", {
        senderId,
        image: imageLink,
      });
    } else {
      console.log(`User ${receiverId} is not connected.`);
    }
  });

  // Handle private messages
  socket.on("privateMessage", async ({ senderId, receiverId, message }) => {
    const receiverSocketId = userSocketMap[receiverId];
    console.log("Hello");
    await sendMessage(senderId, receiverId, message);
    if (receiverSocketId) {
      console.log(message);

      io.to(receiverSocketId).emit("privateMessage", { senderId, message });
    } else {
      console.log(`User ${receiverId} is not connected.`);
    }
  });
  socket.on("newOrder", async ({ restaurantId }) => {
    console.log("Order Place to:" + restaurantId);
    const receiverSocketId = restaurantSocketMap[restaurantId];
    if (receiverSocketId) {
      console.log("INSIDE");
      io.to(receiverSocketId).emit("newOrder");
    } else {
      console.log(`User ${restaurantId} is not connected.`);
    }
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    // Remove user from the mapping on disconnect
    const userId = Object.keys(userSocketMap).find(
      (key) => userSocketMap[key] === socket.id
    );
    if (userId) {
      delete userSocketMap[userId];
      console.log(`User ${userId} disconnected.`);
    }
  });

  // Handle user reconnect
  socket.on("connect", () => {
    userSocketMap[userId] = socket.id;
  });
});

db.sequelize.sync({}).then(() => {
  // Start the server
  server.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
});
