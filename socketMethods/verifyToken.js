const jwt = require("jsonwebtoken");
exports.verifyToken = (socket, next) => {
  if (socket.handshake.query && socket.handshake.query.token) {
    const token = socket.handshake.query.token;
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return next(new Error("Authentication error"));
      }
      socket.userId = decoded.id;
      return next();
    });
  } else return next(new Error("Authentication error"));
};
