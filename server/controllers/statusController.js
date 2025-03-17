import Status from "../model/status.model.js";
import {
  deleteFileFromCloudinary,
  uploadOnCloudinary,
} from "../utilities/cloudinary.js";
import { asyncHandler } from "../utilities/asyncHandler.utility.js";
import { ApiError } from "../utilities/ApiError.utility.js";
import { ApiResponse } from "../utilities/ApiResponse.utility.js";

export const uploadStatus = asyncHandler(async (req, res) => {
  try {
    const { userId, text, viewers } = req.body;
    if (text === "" && !req.file) {
      throw new ApiError(400, "message or file is required");
    }
    const parsedViewers = viewers ? JSON.parse(viewers) : [];
    let mediaUrl = null;

    if (req.file) {
      const result = await uploadOnCloudinary(req.file.path);
      if (!result) throw new ApiError(500, "File upload failed");
      mediaUrl = result.secure_url;
    }

    const newStatus = new Status({
      userId,
      text,
      mediaUrl,
      viewers: parsedViewers,
    });

    await newStatus.save();
    res.status(201).json(new ApiResponse(201, "Status uploaded!", newStatus));
  } catch (error) {
    res.status(500).json(new ApiError(500, error.message));
  }
});

export const deleteStatus = asyncHandler(async (req, res) => {
  try {
    const { statusId, mediaUrl } = req.body;
    if (mediaUrl) {
      await deleteFileFromCloudinary(mediaUrl);
    }
    const dltStatus = await Status.findByIdAndDelete(statusId);
    res.status(200).json(new ApiResponse(200, "status deleted", dltStatus));
  } catch (error) {
    res.status(500).json(new ApiError(500, error.message));
  }
});

export const getStatuses = async (req, res) => {
  try {
    const userId = req.user._id; // Logged-in user ID

    const visibleStatuses = await Status.aggregate([
      {
        $match: { viewers: userId },
      },
      {
        $group: {
          _id: "$userId",
          statuses: {
            $push: {
              _id: "$_id",
              text: "$text",
              mediaUrl: "$mediaUrl",
              seenBy: "$seenBy",
              createdAt: "$createdAt",
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $project: {
          _id: 0,
          user: {
            _id: "$userDetails._id",
            username: "$userDetails.username",
            fullname: "$userDetails.fullname",
            avatar: "$userDetails.avatar",
            isActive: "$userDetails.isActive",
          },
          statuses: 1,
        },
      },
    ]);

    res.status(200).json({ success: true, statuses: visibleStatuses });
  } catch (error) {
    console.error("Error fetching statuses:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const markStatusAsSeen = asyncHandler(async (req, res) => {
  try {
    const { statusId } = req.body;
    const userId = req.user._id;

    const status = await Status.findById(statusId);
    if (!status) {
      return res
        .status(404)
        .json({ success: false, message: "Status not found" });
    }

    if (!status.seenBy.includes(userId)) {
      status.seenBy.push(userId);
      await status.save();
    }

    res.status(200).json({ success: true, message: "Status marked as seen" });
  } catch (error) {
    console.error("Error marking status as seen:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});
