import type { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "../utils/errors.js";
import { allowedOrigins } from "../config/cors.js";

const allowedOriginSet = new Set(allowedOrigins);

export const validateOrigin = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const origin = req.get("Origin");

  if (!origin || !allowedOriginSet.has(origin)) {
    return next(new ForbiddenError("Forbidden origin"));
  }

  next();
};