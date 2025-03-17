import { Router } from "express";
import {
  deleteStatus,
  getStatuses,
  markStatusAsSeen,
  uploadStatus,
} from "../controllers/statusController.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyUser } from "../middleware/auth.middleware.js";

const statusRouter = Router();

statusRouter.post("/upload-status", upload.single("file"), uploadStatus);
statusRouter.delete("/delete-status", deleteStatus);
statusRouter.get("/get-status", verifyUser, getStatuses);
statusRouter.put("/seen", verifyUser, markStatusAsSeen);
export default statusRouter;
