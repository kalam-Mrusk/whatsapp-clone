import User from "../model/user.model.js";
import { ApiError } from "../utilities/ApiError.utility.js";
import { ApiResponse } from "../utilities/ApiResponse.utility.js";
import { asyncHandler } from "../utilities/asyncHandler.utility.js";
import {
  deleteFileFromCloudinary,
  uploadOnCloudinary,
} from "../utilities/cloudinary.js";

const getAllUser = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(400, "Unauthorized access");
  }

  const allUser = await User.find({}).select("-password");
  res.status(200).json(new ApiResponse(200, "All users", { allUser }));
});
const getCurrentUser = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(400, "Unauthorized access");
  }

  const accessToken = user.generateAccessToken();

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000,
    //      1day 1hour 1min  1sec
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .json(new ApiResponse(200, "Current user verified", { user }));
});
const userRegistration = asyncHandler(async (req, res) => {
  const { username, fullname, email, password } = req.body;

  const incompleteDetails = [username, fullname, email, password].some(
    (item) => {
      return item === null || item.trim() === "";
    }
  );
  if (incompleteDetails) {
    throw new ApiError(409, "incomplete details.");
  }
  const existedUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existedUser) {
    throw new ApiError(402, "User already existed.");
  }
  const registerUser = await User.create({
    username,
    fullname,
    email,
    password,
  });
  const { ...data } = registerUser._doc;
  delete data.password;
  res
    .status(200)
    .json(new ApiResponse(200, "user register successfully.", data));
});

const userLogin = asyncHandler(async (req, res) => {
  const { usernameORemail, password } = req.body;
  const incompleteDetails = [usernameORemail, password].some((item) => {
    return item.trim() === "";
  });
  if (incompleteDetails) {
    throw new ApiError(409, "incomplete details");
  }
  const user = await User.findOne({
    $or: [{ email: usernameORemail }, { username: usernameORemail }],
  });
  if (!user) {
    throw new ApiError(401, "user not found");
  }
  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(409, "Wrong password.");
  }
  // const onlineUser = await User.findByIdAndUpdate(
  //   user._doc._id,
  //   { $set: { isActive: "online" } },
  //   { new: true }
  // ).select("-password");
  const accessToken = user.generateAccessToken();
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000,
    //      1day 1hour 1min  1sec
  };
  delete user.password;
  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(200, "user Login successfully.", {
        accessToken,
        user: user,
      })
    );
});
const userLoggedOut = asyncHandler(async (req, res) => {
  const user = req.user;
  // const offlineUser = await User.findByIdAndUpdate(
  //   user._id,
  //   { $set: { isActive: "offline" } },
  //   { new: true }
  // ).select("-password");
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };
  res
    .status(200)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200, "user logged out successfully."));
});

const updateAvatar = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  let fileUrl = null;

  // Upload file if exists
  if (req.file) {
    const user = await User.findById(userId);
    if (user.avatar) await deleteFileFromCloudinary(user.avatar);
    const uploadResult = await uploadOnCloudinary(req.file.path);
    if (!uploadResult) throw new Error("File upload failed");
    fileUrl = uploadResult.secure_url;
  }
  const updatedAvatar = await User.findByIdAndUpdate(userId, {
    avatar: fileUrl,
  });
  res.status(200).json({ message: "avatar updated", url: fileUrl });
});

const updateAbout = async (req, res) => {
  const { about } = req.body;

  if (!about) {
    return res.status(400).json({ message: "About field is required!" });
  }

  if (!req.user._id) {
    return res.status(403).json({ message: "Unauthorized action!" });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { about } },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found!" });
    }

    res
      .status(200)
      .json({ message: "About updated successfully!", updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Error updating about!", error });
  }
};

export {
  userRegistration,
  userLogin,
  userLoggedOut,
  getCurrentUser,
  getAllUser,
  updateAvatar,
  updateAbout,
};
