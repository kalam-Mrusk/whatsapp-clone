import express, { json, urlencoded } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";
import userRouter from "./routes/user.routes.js";
import Message from "./model/message.model.js";
import messageRouter from "./routes/message.routes.js";
import groupRouter from "./routes/group.routes.js";
import statusRouter from "./routes/status.routes.js";
import User from "./model/user.model.js";
dotenv.config({ path: "./.env" });
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "https://whatsapp-m04k.onrender.com" }, // Allow all origins for testing
});
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:4173",
      "https://whatsapp-m04k.onrender.com",
    ],
    credentials: true,
  })
);

app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/api/chat-app/user", userRouter);
app.use("/api/chat-app/message", messageRouter);
app.use("/api/chat-app/group", groupRouter);
app.use("/api/chat-app/status", statusRouter);

const onlineUsers = new Map();
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (!userId) {
    return socket.disconnect();
  }
  console.log(`User connected: ${socket.id} --> ${userId}`);

  // Store user in a room based on their userId (for private messaging)
  socket.join(userId);
  console.log(`User joined private room: ${userId}`);

  // show user online
  socket.on("userOnline", async (userId) => {
    if (userId) {
      onlineUsers.set(userId, socket.id);
      await User.findByIdAndUpdate(userId, { isActive: "online" });
      io.emit("updateAllUserStatus", Array.from(onlineUsers.keys()));
    }
  });

  /**  PRIVATE CHAT */
  socket.on("joinPrivate", () => {
    socket.join(userId); // Users only join their own private room
  });

  socket.on("sendPrivateMessage", (data) => {
    // Send the message to both the sender and receiver
    io.to(data.sender).to(data.receiver).emit("receivePrivateMessage", data);
  });

  /**  GROUP CHAT */
  socket.on("joinGroup", (groupId) => {
    if (!groupId) return;
    socket.join(groupId);
    console.log(`User ${userId} joined group: ${groupId}`);
  });

  socket.on("sendGroupMessage", async (data) => {
    console.log(
      `Group Message from ${data.sender} in Group ${data.groupId}: ${data.message}`
    );

    // Broadcast only to group members
    io.in(data.groupId).emit("receiveGroupMessage", data);
  });

  socket.on("sendLike", (data) => {
    if (!data.messageId || !data.userId) return;

    if (data.receiver) {
      // Private chat: Emit like to sender & receiver
      io.to([data.sender, data.receiver]).emit("receiveLikePrivate", {
        messageId: data.messageId,
        userId: data.userId,
      });
    }

    if (data.groupMembers) {
      // Group chat: Emit like to all group members
      io.to(data.groupMembers).emit("receiveLikeGroup", {
        messageId: data.messageId,
        userId: data.userId,
      });
    }
  });

  socket.on("deleteMessage", ({ messageId, sender, receiver, groupId }) => {
    try {
      if (!messageId) {
        return;
      }

      // Send real-time update
      if (groupId) {
        // Group Chat: Notify all members
        io.to(groupId).emit("receiveMessageDelete", { messageId });
      } else {
        // Private Chat: Notify only the sender and receiver
        io.to([sender, receiver]).emit("receiveMessageDelete", { messageId });
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  });

  // Handle typing event
  socket.on("typing", ({ senderId, receiverId, groupId, isTyping }) => {
    if (receiverId) {
      // Private chat: Notify receiver
      socket
        .to(receiverId)
        .emit("userTyping", { senderId, isTyping, groupId: null });
    } else if (groupId) {
      // Group chat: Notify group members
      socket.to(groupId).emit("userTyping", { senderId, isTyping, groupId });
    }
  });

  // Listen for new status addition
  socket.on("addStatus", ({ newStatus, userDetail }) => {
    io.emit("statusAdded", { newStatus, userDetail }); // Broadcast to all users
  });

  // Listen for status deletion
  socket.on("deleteStatus", ({ userId, statusId }) => {
    io.emit("statusDeleted", { userId, statusId }); // Broadcast deletion
  });

  socket.on("statusSeen", ({ statusId, userId }) => {
    io.emit("statusUpdated", { statusId, userId });
  });

  socket.on("markMessageSeen", async ({ messageId, userId }) => {
    try {
      const updatedMessage = await Message.findByIdAndUpdate(
        messageId,
        { $addToSet: { seenBy: userId } },
        { new: true }
      );

      io.emit("messageSeen", { _id: messageId, userId });
    } catch (error) {
      console.error("Error marking message as seen:", error);
    }
  });

  /**  DISCONNECT EVENT */
  socket.on("disconnect", async () => {
    let disconnectedUserId = null;
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        disconnectedUserId = userId;
        onlineUsers.delete(userId);
        break;
      }
    }

    if (disconnectedUserId) {
      await User.findByIdAndUpdate(disconnectedUserId, { isActive: "offline" });
      io.emit("updateAllUserStatus", Array.from(onlineUsers.keys()));
    }
    console.log(`User disconnected: ${socket.id} --> ${userId}`);
  });
});

export default server;
