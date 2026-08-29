import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";


export const errorHandler = (
  err: Error | ApiError ,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error({
    method: req.method,
    url: req.originalUrl,
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


  if (err instanceof ApiError && err.isOperational) {
    res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      ...(err.errors.length > 0 && { errors: err.errors }),
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