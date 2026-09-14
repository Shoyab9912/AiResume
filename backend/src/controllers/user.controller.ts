import { User } from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ConflictError, NotFoundError, UnauthorizedError } from "../utils/errors.js";
import { setAuthCookies, clearAuthCookies } from "../utils/cookies.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

const registerUser = asyncHandler(async (req, res) => {
  const { email, name, password } = req.body;

  const isUserExists = await User.findOne({ email });

  if (isUserExists) {
    throw new ConflictError("User already exists");
  }

  const user = await User.create({ name, email, password });

  const { refreshToken } = setAuthCookies(res, user._id.toString(), user.email);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const createdUser = await User.findById(user._id);

  if (!createdUser) {
    throw new NotFoundError("user doesn't exist");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "User created successfully", createdUser));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const { refreshToken } = setAuthCookies(res, user._id.toString(), user.email);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const loggedUser = await User.findById(user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Login successful", loggedUser));
});

const logoutUser = asyncHandler(async (req: AuthenticatedRequest, res) => {
  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, {
      $unset: { refreshToken: "" },
    });
  }

  clearAuthCookies(res);

  return res.status(200).json(new ApiResponse(200, "Logout successful"));
});


const getMe = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const user = req.user;

  return res.status(200).json(new ApiResponse(200, "User fetched successfully", user));
});

export { registerUser, loginUser, logoutUser, getMe };