let io = null;

function initSocket(server) {
  const { Server } = require("socket.io");
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("chat:join-user", (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`Socket ${socket.id} joined room user:${userId}`);
      }
    });

    socket.on("chat:join-admin", () => {
      socket.join("admins");
      console.log(`Socket ${socket.id} joined room admins`);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error("Socket.IO chưa được khởi tạo. Gọi initSocket(server) trước.");
  }
  return io;
}

module.exports = { initSocket, getIO };