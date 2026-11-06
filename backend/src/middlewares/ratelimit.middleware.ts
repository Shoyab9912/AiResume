import {rateLimit,ipKeyGenerator} from "express-rate-limit";
import { ApiError } from "../utils/ApiError.js";

const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  handler: (_req, _res, next) => {
    next(new ApiError(429, "Too many requests, please try again later."));
  },
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  handler: (_req, _res, next) => {
    next(
      new ApiError(
        429,
        "Too many failed authentication attempts. Please try again in 15 minutes.",
      ),
    );
  },
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

const otpRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 1,
  skipFailedRequests: true,
  keyGenerator: (req) => {
    const email = req.body?.email;
    if (typeof email === "string" && email.trim()) {
      return `email:${email.toLowerCase().trim()}`;
    }
    return `ip:${ipKeyGenerator(req.ip ?? "")}`;
  },
  handler: (_req, _res, next) => {
    next(new ApiError(429, "Please wait 60 seconds before requesting a new OTP."));
  },
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

export { generalRateLimiter, authRateLimiter, otpRateLimiter };