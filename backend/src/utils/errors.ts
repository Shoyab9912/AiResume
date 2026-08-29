
import { ApiError } from "./ApiError.js";

class NotFoundError extends ApiError {
  constructor(message: string = "resource not found") {
    super(404, message);
  }
}

class BadRequestError extends ApiError {
  constructor(message: string = "Bad request") {
    super(400, message);
  }
}

class ValidationError extends ApiError {
  constructor(message: string = "Validation failed", errors: unknown[] = []) {
    super(422, message, errors);
  }
}

class UnauthorizedError extends ApiError {
  constructor(message: string = "Unauthorized") {
    super(401, message);
  }
}

class ConflictError extends ApiError {
  constructor(message: string = "Conflict") {
    super(409, message);
  }
}

class ForbiddenError extends ApiError {
  constructor(message: string = "forbidden to access") {
    super(403, message);
  }
}

export {
  NotFoundError,
  ConflictError,
  ValidationError,
  UnauthorizedError,
  BadRequestError,
  ForbiddenError,
};