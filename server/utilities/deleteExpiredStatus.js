import cron from "node-cron";
import moment from "moment";
import Status from "../model/status.model.js";
import { deleteFileFromCloudinary } from "./cloudinary.js";

//  Run every 1 minutes
cron.schedule("* * * * *", async () => {
  try {
    const expirationTime = moment().subtract(24, "hours").toDate();

    //  Find statuses older than 24 hours
    const expiredStatuses = await Status.find({
      createdAt: { $lt: expirationTime },
    });

    for (const status of expiredStatuses) {
      // If it's an image/video, delete from Cloudinary
      if (status.mediaUrl) {
        const res = await deleteFileFromCloudinary(status.mediaUrl);
      }

      //  Remove status from MongoDB
      await Status.findByIdAndDelete(status._id);
    }

    if (expiredStatuses.length > 0) {
      console.log(
        ` Deleted ${expiredStatuses.length} expired statuses & files`
      );
    }
  } catch (error) {
    console.error(" Error deleting expired statuses:", error);
  }
});
