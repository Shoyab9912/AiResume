import asyncHandler from "../utils/asyncHandler.js";
import { LoginProvider, User } from "../models/user.model.js";
import { BadRequestError, UnauthorizedError } from "../utils/errors.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { verifyGoogleIdToken } from "../utils/googleAuth.js";
import jwt, { JwtPayload } from "jsonwebtoken";

export const googleLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    throw new BadRequestError("Google ID token is required");
  }

  const payload = await verifyGoogleIdToken(idToken);

  const { email, name, picture, email_verified } = payload;

  if (!email || !email_verified) {
    throw new UnauthorizedError("Invalid or unverified Google account");
  }

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name: name || "Google User",
      email,
      image: picture ?? "",
      loginProvider: LoginProvider.GOOGLE,
    });
  } else if (!user.image && picture) {
    user.image = picture;
    await user.save();
  }

  const accessToken = generateAccessToken(user._id.toString(), user.email);

  const refreshToken = generateRefreshToken(user._id.toString());

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Google login successful", user));
});

export const generateAccessAndRefreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    throw new UnauthorizedError("No refresh token");
  }

  const decoded = jwt.verify(
    token,
    process.env.REFRESH_TOKEN_SECRET as string,
  ) as JwtPayload;

  const user = await User.findById(decoded.userId).select("+refreshToken");

  if (!user || !user.refreshToken !== token) {
    throw new UnauthorizedError("invalid token");
  }

  const accessToken = generateAccessToken(user._id.toString(), user.email);

  const refreshToken = generateRefreshToken(user._id.toString());

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200,"refreshed succesfully",accessToken))
});
