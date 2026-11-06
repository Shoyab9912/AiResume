import { Router } from "express";

import {
  registerUser,
  verifyOtp,
  resendOtp,
  loginUser,
  logoutUser,
  getMe,
} from "../controllers/user.controller.js";

import { validate } from "../middlewares/validate.middleware.js";
import {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
} from "../validators/auth.validator.js";

import { verifyJwt } from "../middlewares/auth.middleware.js";
import { requireCsrf } from "../middlewares/csrf.middleware.js";
import { validateOrigin } from "../middlewares/validateorigin.middleware.js";

import {
  authRateLimiter,
  otpRateLimiter,
} from "../middlewares/ratelimit.middleware.js";

const router = Router();

router.post(
  "/register",
  validateOrigin,
  authRateLimiter,
  validate(registerSchema),
  registerUser
);

router.post(
  "/verify-otp",
  validateOrigin,
  authRateLimiter,
  validate(verifyOtpSchema),
  verifyOtp
);

router.post(
  "/resend-otp",
  validateOrigin,
  authRateLimiter,
  otpRateLimiter,
  validate(resendOtpSchema),
  resendOtp
);

router.post(
  "/login",
  validateOrigin,
  authRateLimiter,
  validate(loginSchema),
  loginUser
);

router.post("/logout", verifyJwt, requireCsrf, logoutUser);
router.get("/me", verifyJwt, getMe);

export default router;