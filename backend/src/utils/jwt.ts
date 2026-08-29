import jwt from "jsonwebtoken";

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
