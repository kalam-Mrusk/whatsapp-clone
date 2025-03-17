import { Router } from "express";
import { verifyUser } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import {
  getAllUser,
  getCurrentUser,
  updateAbout,
  updateAvatar,
  userLoggedOut,
  userLogin,
  userRegistration,
} from "../controllers/user.controller.js";

const userRouter = Router();
userRouter.get("/get-current-user", verifyUser, getCurrentUser);
userRouter.post("/auth/register", userRegistration);
userRouter.post("/auth/login", userLogin);
userRouter.get("/auth/logout", verifyUser, userLoggedOut);
userRouter.get("/all-user", verifyUser, getAllUser);
userRouter.put("/update-about", verifyUser, updateAbout);
userRouter.post("/update/avatar", upload.single("file"), updateAvatar);

export default userRouter;
