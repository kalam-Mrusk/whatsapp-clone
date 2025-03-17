import User from "../model/user.model.js";
import { ApiError } from "../utilities/ApiError.utility.js";
import { asyncHandler } from "../utilities/asyncHandler.utility.js";
import jwt from "jsonwebtoken";
const verifyUser = asyncHandler(async (req, res, next) => {
  try {
    const accessToken = req.cookies?.accessToken;

    if (!accessToken) {
      throw new ApiError(400, "Unauthorized Access.");
    }
    const decode = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET_KEY);
    const user = await User.findById(decode._id).select("-password");
    if (!user) {
      throw new ApiError(400, "Invalid access token");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(400, error.message || "something went wrong");
  }
});
export { verifyUser };
