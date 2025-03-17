import Group from "../model/group.model.js";
import Message from "../model/message.model.js";
import { ApiError } from "../utilities/ApiError.utility.js";
import { ApiResponse } from "../utilities/ApiResponse.utility.js";
import { asyncHandler } from "../utilities/asyncHandler.utility.js";
import {
  deleteFileFromCloudinary,
  uploadOnCloudinary,
} from "../utilities/cloudinary.js";

const createGroup = asyncHandler(async (req, res) => {
  const { name, members, admin } = req.body;

  if (!name || !admin || members.length < 2) {
    return res.status(400).json(new ApiError(400, "Invalid group data"));
  }

  const group = new Group({ name, members, admin });
  await group.save();

  res
    .status(201)
    .json(new ApiResponse(201, "group created successfully", group));
});

const addUserToGroup = asyncHandler(async (req, res) => {
  const { groupId, userId } = req.body;

  const group = await Group.findById(groupId);
  if (!group) return res.status(404).json(new ApiError(404, "group not found"));

  if (!group.members.includes(userId)) {
    group.members.push(userId);
    await group.save();
  }

  res.status(200).json(new ApiResponse(200, "User added to group", group));
});
const removeUserFromGroup = asyncHandler(async (req, res) => {
  const { groupId, userId } = req.body;

  const group = await Group.findById(groupId);
  if (!group) return res.status(404).json(new ApiError(404, "Group not found"));

  if (!group.members.includes(userId)) {
    return res.status(400).json(new ApiError(400, "User is not in the group"));
  }

  group.members = group.members.filter(
    (member) => member.toString() !== userId
  );
  await group.save();

  res.status(200).json(new ApiResponse(200, "User removed from group", group));
});

const getGroupDetails = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const group = await Group.findById(groupId).populate("members", "username");
  if (!group) return res.status(404).json(new ApiError(404, "Group not found"));

  res.status(200).json(new ApiResponse(200, "group detail", group));
});
const getAllGroup = asyncHandler(async (req, res) => {
  const data = await Group.find({});
  res.status(200).json(new ApiResponse(200, "all group data", data));
});

const sendGroupMessage = asyncHandler(async (req, res) => {
  const { sender, groupId, message, fileUrl } = req.body;

  if (!message && !fileUrl) {
    return res
      .status(400)
      .json(new ApiError(400, "Message or file is required"));
  }

  const newMessage = new Message({
    sender,
    groupId,
    message,
    fileUrl,
  });

  await newMessage.save();
  res
    .status(201)
    .json(new ApiResponse(201, "group message send successfully", newMessage));
});

const updateGroupPic = asyncHandler(async (req, res) => {
  const { groupId } = req.body;
  let fileUrl = null;

  // Upload file if exists
  if (req.file) {
    const group = await Group.findById(groupId);
    if (group.groupPic) await deleteFileFromCloudinary(group.groupPic);
    const uploadResult = await uploadOnCloudinary(req.file.path);
    if (!uploadResult) throw new Error("File upload failed");
    fileUrl = uploadResult.secure_url;
  }
  const updatedAvatar = await Group.findByIdAndUpdate(groupId, {
    groupPic: fileUrl,
  });
  res.status(200).json({ message: "group pic updated", url: fileUrl });
});

export {
  createGroup,
  addUserToGroup,
  getGroupDetails,
  sendGroupMessage,
  getAllGroup,
  removeUserFromGroup,
  updateGroupPic,
};
