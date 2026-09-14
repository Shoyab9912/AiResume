import { type CookieOptions, type Response } from "express";
import { generateAccessToken, generateRefreshToken, createCsrfToken } from "./jwt.js";

const ACCESS_COOKIE = "access_token";
const REFRESH_COOKIE = "refresh_token";
const CSRF_COOKIE = "csrf_token";

const COOKIE_SECURE = true;
const COOKIE_SAME_SITE: CookieOptions["sameSite"] = "none";

function createCookieOptions(maxAge: number): CookieOptions {
  return {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: COOKIE_SAME_SITE,
    path: "/",
    maxAge,
  };
}

function createCsrfCookieOptions(maxAge: number): CookieOptions {
  return {
    httpOnly: false,
    secure: COOKIE_SECURE,
    sameSite: COOKIE_SAME_SITE,
    path: "/",
    maxAge,
  };
}

export function setAuthCookies(res: Response, userId: string, email: string) {
  const accessToken = generateAccessToken(userId, email);
  const refreshToken = generateRefreshToken(userId);
  const csrfToken = createCsrfToken();

  const accessMaxAge = 15 * 60 * 1000;
  const refreshMaxAge = 7 * 24 * 60 * 60 * 1000;

  res.cookie(ACCESS_COOKIE, accessToken, createCookieOptions(accessMaxAge));
  res.cookie(REFRESH_COOKIE, refreshToken, createCookieOptions(refreshMaxAge));
  res.cookie(CSRF_COOKIE, csrfToken, createCsrfCookieOptions(refreshMaxAge));

  return { accessToken, refreshToken, csrfToken };
}

export function clearAuthCookies(res: Response) {
  const clearOptions: CookieOptions = {
    secure: COOKIE_SECURE,
    sameSite: COOKIE_SAME_SITE,
    path: "/",
  };

  res.clearCookie(ACCESS_COOKIE, clearOptions);
  res.clearCookie(REFRESH_COOKIE, clearOptions);
  res.clearCookie(CSRF_COOKIE, clearOptions);
}

export { ACCESS_COOKIE, REFRESH_COOKIE, CSRF_COOKIE };