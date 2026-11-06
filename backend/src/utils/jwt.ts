import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { env } from "../config/env.validation.js";

export function generateAccessToken(userId: string, email: string): string {
  return jwt.sign(
    { userId, email },
    env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" },
  );
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign(
    { userId },
    env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" },
  );
}

export function createCsrfToken(): string {
  return crypto.randomBytes(32).toString("hex");
}