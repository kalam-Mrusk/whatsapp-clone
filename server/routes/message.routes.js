import { Router } from "express";
import {
  conversationsList,
  deleteMessage,
  getGroupMessages,
  getPrivateMessages,
  likeMessage,
  sendMessage,
} from "../controllers/message.controller.js";
import { verifyUser } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
const messageRouter = Router();

messageRouter.post("/send", upload.single("file"), sendMessage); // Send a message
messageRouter.get("/private/:userId/:receiverId", getPrivateMessages); // Get one-to-one messages
messageRouter.get("/group/:userId/:groupId", getGroupMessages); // Get group messages
messageRouter.get("/conversations", verifyUser, conversationsList);
messageRouter.delete("/delete-msg", deleteMessage);
messageRouter.put("/like", likeMessage);

export default messageRouter;
