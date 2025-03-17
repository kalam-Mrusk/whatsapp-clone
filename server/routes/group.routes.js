import { Router } from "express";
import {
  addUserToGroup,
  createGroup,
  getAllGroup,
  getGroupDetails,
  removeUserFromGroup,
  sendGroupMessage,
  updateGroupPic,
} from "../controllers/group.controller.js";
import { verifyUser } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const groupRouter = Router();

groupRouter.post("/create", createGroup); // Create a new group
groupRouter.post("/add", addUserToGroup); // Add a user to a group
groupRouter.post("/remove", removeUserFromGroup); // remove a user from group
groupRouter.get("/detail/:groupId", getGroupDetails); // Get group details
groupRouter.get("/all-group", verifyUser, getAllGroup); // Get all group
groupRouter.post("/message", sendGroupMessage); // Send a message in a group
groupRouter.post("/update/pic", upload.single("file"), updateGroupPic);

export default groupRouter;
