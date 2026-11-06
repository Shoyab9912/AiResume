import crypto from "crypto";
import { User } from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  ConflictError,
  UnauthorizedError,
  BadRequestError,
} from "../utils/errors.js";
import { setAuthCookies, clearAuthCookies } from "../utils/cookies.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { hashOtp } from "../utils/otp.js";
import { createAndSendOtp } from "../services/otp.service.js";
import redis from "../config/redis.js";
import {
  getOtpAttemptKey,
  incrementOtpAttempts,
} from "../utils/otpAttempts.js";
import { generateHash } from "../utils/generateHash.js";




export async function checkOtpLock(email: string): Promise<void> {
  const attemptsKey = getOtpAttemptKey(email);

  const attempts = Number(
    (await redis.get(attemptsKey)) ?? 0
  );

  if (attempts >= 5) {
    throw new BadRequestError(
      "Too many incorrect attempts. Please try again after 15 minutes."
    );
  }
}



const registerUser = asyncHandler(async (req, res) => {
  const { name, password } = req.body;
  const email = req.body.email.trim().toLowerCase();

  await checkOtpLock(email);


  const existingUser = await User.findOne({ email });

  if (existingUser) {
    if (existingUser.isVerified) {
      throw new ConflictError("Unable to register with this email address");
    }

    existingUser.name = name;
    existingUser.password = password;
    await existingUser.save();

    await createAndSendOtp(email);

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          "Registered. Check your email for a verification code",
          { email: existingUser.email },
        ),
      );
  }

  const user = await User.create({ name, email, password });

  await createAndSendOtp(email);

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        "Registered. Check your email for a verification code",
        { email: user.email },
      ),
    );
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { otp } = req.body;
  const email = req.body.email.trim().toLowerCase();

  const otpKey = `otp:${email}`;
  const attemptsKey = getOtpAttemptKey(email);

  const currentAttempts = Number((await redis.get(attemptsKey)) ?? 0);

  if (currentAttempts >= 5) {
    throw new BadRequestError(
      "Too many incorrect attempts. Please try again after 15 minutes.",
    );
  }

  const [user, storedHash] = await Promise.all([
    User.findOne({ email }),
    redis.get(otpKey),
  ]);

  if (!user || user.isVerified || !storedHash) {
    throw new BadRequestError("Invalid or expired verification code");
  }

  const submittedHash = hashOtp(otp);

  const storedBuf = Buffer.from(storedHash, "hex");
  const submittedBuf = Buffer.from(submittedHash, "hex");

  const isValid =
    storedBuf.length === submittedBuf.length &&
    crypto.timingSafeEqual(storedBuf, submittedBuf);

  if (!isValid) {
    await incrementOtpAttempts(otpKey, attemptsKey);

    throw new BadRequestError("Invalid or expired verification code");
  }

  const { refreshToken } = setAuthCookies(res, user._id.toString(), user.email);

  user.isVerified = true;
  user.refreshToken = generateHash(refreshToken);

  await user.save({ validateBeforeSave: false });

  await redis.unlink(otpKey, attemptsKey);

  const verifiedUser = await User.findById(user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Email verified successfully", verifiedUser));
});

const resendOtp = asyncHandler(async (req, res) => {
  const email = req.body.email.trim().toLowerCase();

  await checkOtpLock(email)

  const user = await User.findOne({ email }).select("email isVerified").lean();

  if (user && !user.isVerified) {
    await createAndSendOtp(user.email);
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "If an unverified account exists, a verification code has been sent",
        null,
      ),
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const email = req.body.email.trim().toLowerCase();

  const user = await User.findOne({ email }).select("+password");

  if (!user || !user.password) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new UnauthorizedError("Invalid email or password");
  }

  if (!user.isVerified) {
    throw new UnauthorizedError("Please verify your email before logging in");
  }

  const { refreshToken } = setAuthCookies(res, user._id.toString(), user.email);

  const loggedUser = await User.findByIdAndUpdate(
    user._id,
    {
      $set: {
        refreshToken: generateHash(refreshToken),
      },
    },
    { returnDocument: "after" },
  );

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

  return res
    .status(200)
    .json(new ApiResponse(200, "User fetched successfully", user));
});

export { registerUser, verifyOtp, resendOtp, loginUser, logoutUser, getMe };
