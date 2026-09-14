import jwt from "jsonwebtoken";
import crypto from "node:crypto"

export function generateAccessToken(userId: string, email: string): string {
  return jwt.sign(
    { userId, email },
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn: "15m" },
  );
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET as string, {
    expiresIn: "7d",
  });
}

export function createCsrfToken() {
  return crypto.randomBytes(32).toString("hex");
}

