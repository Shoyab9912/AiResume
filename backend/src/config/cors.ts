import { env } from "./env.validation.js";

export const allowedOrigins = [
  env.CORS_ORIGIN,
  ...(env.NODE_ENV !== "production"
    ? ["http://localhost:5173"]
    : []),
].filter((origin): origin is string => Boolean(origin));