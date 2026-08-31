import { Request } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { User, IUser } from "../models/user.model.js";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UnauthorizedError } from "../utils/errors.js";

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const verifyJwt = asyncHandler(async (req, res, next) => {
  const token =
    req.header("Authorization")?.replace(/^Bearer\s+/i, "") ||
    req.cookies?.accessToken;

  if (!token) {
    throw new UnauthorizedError("Authentication required");
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as JwtPayload;

    if (!decoded || !decoded.userId) { 
      throw new UnauthorizedError("Invalid token");
    }

    const user = await User.findById(decoded.userId); 

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    (req as AuthenticatedRequest).user = user;

    next();
  } catch {
    throw new UnauthorizedError("Invalid or expired access token");
  }
});