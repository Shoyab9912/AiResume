import { User } from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/errors.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";


const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
};


const registerUser = asyncHandler(async (req, res) => {
  const { email, name, password } = req.body;

  const isUserExists = await User.findOne({ email });

  if (isUserExists) {
    throw new ConflictError("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  const createdUser = await User.findById(user._id)

  if(!createdUser) {
    throw new NotFoundError("user doesn't exist")
  }


   const accessToken = generateAccessToken(user._id.toString(), user.email);
  const refreshToken = generateRefreshToken(user._id.toString());

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

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

  const accessToken = generateAccessToken(user._id.toString(), user.email);

  const refreshToken = generateRefreshToken(user._id.toString());

  user.refreshToken = refreshToken;
  await user.save({validateBeforeSave:false})

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, 
  });

  res.cookie("refreshToken", refreshToken, {
   ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, 
  });

  
  const loggedUser = await User.findById(user._id)
  return res.status(200).json(
    new ApiResponse(
      200,
      "Login successful",
      loggedUser
    )
  );
});


const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie("accessToken", cookieOptions);

  res.clearCookie("refreshToken",cookieOptions);

  return res
    .status(200)
    .json(new ApiResponse(200, "Logout successful"));
});




const getMe = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    return res.status(200).json(
      new ApiResponse(
        200,
        "User fetched successfully",
        user
      )
    );
  }
);


export {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
};