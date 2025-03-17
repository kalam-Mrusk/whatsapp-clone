import { ApiError } from "./ApiError.utility.js";

const asyncHandler = (requestHandler) => async (req, res, next) => {
  try {
    await requestHandler(req, res, next);
  } catch (error) {
    res
      .status(error.status || 400)
      .json(new ApiError(error.status, error.message));
    next(error);
  }
};

export { asyncHandler };
