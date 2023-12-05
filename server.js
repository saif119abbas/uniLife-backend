const app = require("./app");
const dotenv = require("dotenv");
dotenv.config({ path: ".env" });
const db = require("./models");
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:8081", "http://localhost:8082"],
    methods: ["GET", "POST"],
  },
});

// Keep track of connected users and their rooms
const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Handle user login
  socket.on("login", (userId) => {
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} logged in.`);
  });

  // Handle private messages
  socket.on("privateMessage", ({ senderId, receiverId, message }) => {
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      console.log(message);
      io.to(receiverSocketId).emit("privateMessage", { senderId, message });
    } else {
      console.log(`User ${receiverId} is not connected.`);
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
});

db.sequelize.sync().then(() => {
  // Start the server
  server.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
});
