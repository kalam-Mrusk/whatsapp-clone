import Group from "../model/group.model.js";
import Message from "../model/message.model.js";
import { ApiError } from "../utilities/ApiError.utility.js";
import { ApiResponse } from "../utilities/ApiResponse.utility.js";
import { asyncHandler } from "../utilities/asyncHandler.utility.js";
import {
  deleteFileFromCloudinary,
  uploadOnCloudinary,
} from "../utilities/cloudinary.js";
const sendMessage = asyncHandler(async (req, res) => {
  const { sender, senderName, receiver, groupId, message } = req.body;
  if (!message && !req.file) {
    throw new ApiError(400, "message or file is required");
  }

  let fileUrl = null;

  // Upload file if exists
  if (req.file) {
    const uploadResult = await uploadOnCloudinary(req.file.path);
    if (!uploadResult) throw new Error("File upload failed");
    fileUrl = uploadResult.secure_url;
  }
  const newMessage = new Message({
    sender,
    senderName,
    receiver,
    groupId,
    message,
    fileUrl,
  });

  await newMessage.save();
  res
    .status(201)
    .json(new ApiResponse(201, "message send successfully", newMessage));
});
const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId, fileSecureUrl } = req.body;
  if (!messageId) {
    throw new ApiError(400, "messageId  is required");
  }

  const deleteMsg = await Message.findByIdAndDelete(messageId);
  let deleteFile;
  if (fileSecureUrl !== null) {
    deleteFile = await deleteFileFromCloudinary(fileSecureUrl);
  }

  res.status(201).json(
    new ApiResponse(201, "message deleted successfully", {
      deleteMsg,
      deleteFile: deleteFile || null,
    })
  );
});
const likeMessage = asyncHandler(async (req, res) => {
  const { messageId, userId } = req.body;

  if (!messageId) throw new ApiError(400, "Message ID required");
  if (!userId) throw new ApiError(400, "User ID required");

  const message = await Message.findById(messageId);
  if (!message) throw new ApiError(404, "Message not found");
  if (message.sender === userId)
    throw new ApiError(400, "sender can not like , own message");
  let updateQuery = {};

  if (message.likeBy.includes(userId)) {
    // If user has already liked, remove the like (Unlike)
    updateQuery = { $pull: { likeBy: userId } };
  } else {
    // If user hasn't liked yet, add the like (Like)
    updateQuery = { $addToSet: { likeBy: userId } };
  }

  const updatedMessage = await Message.findByIdAndUpdate(
    messageId,
    updateQuery,
    { new: true } // Returns the updated document
  );

  res.status(200).json(new ApiResponse(200, "Like toggled", updatedMessage));
});

const getPrivateMessages = asyncHandler(async (req, res) => {
  const { userId, receiverId } = req.params;
  const messages = await Message.find({
    $or: [
      { sender: userId, receiver: receiverId },
      { sender: receiverId, receiver: userId },
    ],
  }).sort({ createdAt: 1 });

  res.status(200).json(new ApiResponse(200, "all private message", messages));
});

const getGroupMessages = asyncHandler(async (req, res) => {
  const { groupId, userId } = req.params;
  const group = await Group.findOne({ _id: groupId });
  if (!group) return;

  if (!group.members.includes(userId)) {
    throw new ApiError(400, "your are not group member");
  }
  const messages = await Message.find({ groupId }).sort({ createdAt: 1 });

  res.status(200).json(new ApiResponse(200, "group messages", messages));
});

const conversationsList = asyncHandler(async (req, res) => {
  const userId = req.user._doc._id;

  try {
    // Private Conversations
    const privateConversationsPipeline = [
      { $match: { $or: [{ sender: userId }, { receiver: userId }] } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ["$sender", userId] }, "$receiver", "$sender"],
          },
          lastMessage: { $first: "$$ROOT" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "partnerDetails",
        },
      },
      { $unwind: "$partnerDetails" },
      {
        $project: {
          conversationId: "$_id",
          type: "private",
          lastMessage: {
            message: "$lastMessage.message",
            fileUrl: "$lastMessage.fileUrl",
            senderId: "$lastMessage.sender",
            senderName: "$lastMessage.senderName",
            createdAt: "$lastMessage.createdAt",
            seenBy: "$lastMessage.seenBy",
            date: {
              $dateToString: {
                date: "$lastMessage.createdAt",
                format: "%Y-%m-%d",
              },
            },
            time: {
              $dateToString: {
                date: "$lastMessage.createdAt",
                format: "%H:%M:%S",
              },
            },
          },
          partnerDetails: {
            _id: "$partnerDetails._id",
            username: "$partnerDetails.username",
            fullname: "$partnerDetails.fullname",
            email: "$partnerDetails.email",
            avatar: "$partnerDetails.avatar",
            about: "$partnerDetails.about",
            isActive: "$partnerDetails.isActive",
          },
        },
      },
    ];

    const privateConversations = await Message.aggregate(
      privateConversationsPipeline
    );

    // Group Conversations
    const groupConversationsPipeline = [
      { $match: { groupId: { $ne: null } } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$groupId",
          lastMessage: { $first: "$$ROOT" },
        },
      },
      {
        $lookup: {
          from: "groups",
          localField: "_id",
          foreignField: "_id",
          as: "groupDetails",
        },
      },
      { $unwind: "$groupDetails" },
      {
        $match: {
          "groupDetails.members": userId,
        },
      },
      {
        $project: {
          conversationId: "$_id",
          type: "group",
          lastMessage: {
            message: "$lastMessage.message",
            fileUrl: "$lastMessage.fileUrl",
            senderId: "$lastMessage.sender",
            senderName: "$lastMessage.senderName",
            createdAt: "$lastMessage.createdAt",
            seenBy: "$lastMessage.seenBy",
            date: {
              $dateToString: {
                date: "$lastMessage.createdAt",
                format: "%Y-%m-%d",
              },
            },
            time: {
              $dateToString: {
                date: "$lastMessage.createdAt",
                format: "%H:%M:%S",
              },
            },
          },
          groupDetails: {
            _id: "$groupDetails._id",
            name: "$groupDetails.name",
            groupPic: "$groupDetails.groupPic",
            admin: "$groupDetails.admin",
            members: "$groupDetails.members",
          },
        },
      },
    ];

    const groupConversations = await Message.aggregate(
      groupConversationsPipeline
    );

    // Combine Private & Group Conversations
    const conversations = [...privateConversations, ...groupConversations].sort(
      (a, b) =>
        new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
    );

    res.json({ conversations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export {
  sendMessage,
  getPrivateMessages,
  getGroupMessages,
  conversationsList,
  deleteMessage,
  likeMessage,
};
