const socket = require("socket.io");
const { Chat } = require("../models/chat");

const initializeSocket = (server) => {
  const io = socket(server, {
    origin: [
      "http://localhost:5173", // local dev
      "https://stumble.live",
      "https://www.stumble.live",
    ],
    credentials: true,
  });

  // Store online users: userId -> socketId
  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    // 1. Handle user going online
    socket.on("userOnline", (userId) => {
      if (!userId) return;

      onlineUsers.set(userId, socket.id);

      // Broadcast to ALL other clients that this user is online
      socket.broadcast.emit("userStatusChanged", {
        userId,
        isOnline: true,
      });
    });

    // 2. Existing joinChat - also mark user as online
    socket.on("joinChat", ({ userId, toUserId }) => {
      if (!userId) return;

      const roomId = [userId, toUserId].sort().join("_");
      socket.join(roomId);

      // Mark user as online when they join any chat
      onlineUsers.set(userId, socket.id);

      // Notify others that this user is online
      socket.broadcast.emit("userStatusChanged", {
        userId,
        isOnline: true,
      });
    });

    // 3. Check if a specific user is online
    socket.on("checkUserOnline", (userId) => {
      const isOnline = onlineUsers.has(userId);

      // Send response back to the requesting client only
      socket.emit("userOnlineStatus", {
        userId,
        isOnline,
      });
    });

    // 4. Get all online users (optional)
    socket.on("getAllOnlineUsers", () => {
      const onlineUserIds = Array.from(onlineUsers.keys());
      socket.emit("onlineUsersList", onlineUserIds);
    });

    // 5. Existing sendMessage handler
    socket.on("sendMessage", async ({ text, sender, toUserId, userId }) => {
      try {
        const roomId = [userId, toUserId].sort().join("_");

        let chat = await Chat.findOne({
          participants: { $all: [userId, toUserId] },
        });

        if (!chat) {
          chat = new Chat({
            participants: [userId, toUserId],
            message: [],
          });
        }

        chat.message.push({
          senderId: userId,
          text,
        });

        await chat.save();

        // Populate to get firstName like your API does
        await chat.populate({
          path: "message.senderId",
          select: "firstName",
        });

        const lastMessage = chat.message[chat.message.length - 1];

        io.to(roomId).emit("messageReceived", {
          senderId: {
            _id: lastMessage.senderId._id,
            firstName: lastMessage.senderId.firstName,
          },
          text: lastMessage.text,
          _id: lastMessage._id,
          createdAt: lastMessage.createdAt,
          updatedAt: lastMessage.updatedAt,
        });
      } catch (error) {
        console.log("Send message error:", error);
      }
    });

    // 6. Handle disconnect - user goes offline
    socket.on("disconnect", () => {
      // Find which user disconnected
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);

          // Broadcast to ALL other clients that this user went offline
          socket.broadcast.emit("userStatusChanged", {
            userId,
            isOnline: false,
          });
          break;
        }
      }
    });

    // 7. Handle manual logout/offline
    socket.on("userOffline", (userId) => {
      if (onlineUsers.has(userId)) {
        onlineUsers.delete(userId);
        console.log(`🔴 User ${userId} manually went offline`);

        socket.broadcast.emit("userStatusChanged", {
          userId,
          isOnline: false,
        });
      }
    });
  });

  return io;
};

module.exports = initializeSocket;
