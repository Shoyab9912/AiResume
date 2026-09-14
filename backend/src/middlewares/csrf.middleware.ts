import { type Request, type Response, type NextFunction } from "express";
import { CSRF_COOKIE } from "../utils/cookies.js";
import { ForbiddenError } from "../utils/errors.js";

export function requireCsrf(req: Request, res: Response, next: NextFunction) {
  const csrfCookie = req.cookies?.[CSRF_COOKIE];
  const csrfHeader = req.header("x-csrf-token");

  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    throw new ForbiddenError("Invalid CSRF token")
  }

  next();
}