import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";

export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  console.error({
    method: req.method,
    url: req.path,
    name: err.name,
    message: err.message,
  });

  if (err.name === "CastError") {
    res.status(400).json({
      status: "error",
      message: "Invalid ID",
    });
    return;
  }

  if (err.name === "ValidationError") {
    res.status(400).json({
      status: "error",
      message: "Validation failed",
    });
    return;
  }

  if ("code" in err && err.code === 11000) {
    res.status(409).json({
      status: "error",
      message: "Duplicate value",
    });
    return;
  }

  if (err instanceof ApiError && err.isOperational) {
    res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      errors: err.errors,
      ...(process.env.NODE_ENV !== "production" && {
        data: err.data,
      }),
    });

    return;
  }

  
  res.status(500).json({
    status: "error",
    message: "Internal Server Error",
    ...(process.env.NODE_ENV !== "production" && {
      error: err.message,
      stack: err.stack,
    }),
  });
};
