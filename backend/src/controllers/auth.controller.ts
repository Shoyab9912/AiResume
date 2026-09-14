import asyncHandler from "../utils/asyncHandler.js";
import { LoginProvider, User } from "../models/user.model.js";
import { BadRequestError, UnauthorizedError } from "../utils/errors.js";
import { setAuthCookies } from "../utils/cookies.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { verifyGoogleIdToken } from "../utils/googleAuth.js";
import jwt, { JwtPayload } from "jsonwebtoken";

export const googleLogin = asyncHandler(async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    throw new BadRequestError("Google ID token is required");
  }

  const payload = await verifyGoogleIdToken(credential);
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
  }

  const { refreshToken } = setAuthCookies(res, user._id.toString(), user.email);

  const shouldUpdateImage = !user.image && picture;
  await User.findByIdAndUpdate(
    user._id,
    {
      refreshToken,
      ...(shouldUpdateImage && { image: picture }),
    },
    { runValidators: true },
  );

  return res.status(200).json(new ApiResponse(200, "Google login successful", user));
});

export const generateAccessAndRefreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refresh_token;

  if (!token) {
    throw new UnauthorizedError("No refresh token");
  }

  const decoded = jwt.verify(
    token,
    process.env.REFRESH_TOKEN_SECRET as string,
  ) as JwtPayload;

  const user = await User.findById(decoded.userId).select("+refreshToken");

  if (!user || user.refreshToken !== token) {
    throw new UnauthorizedError("invalid token");
  }

  const { refreshToken } = setAuthCookies(res, user._id.toString(), user.email);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, "refreshed successfully", null));
});