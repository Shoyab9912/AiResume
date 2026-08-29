
class ApiError extends Error {
  statusCode: number;
  errors: unknown[];
  success: boolean;
  isOperational: boolean;

  constructor(
    statusCode: number,
    message: string = "something went wrong",
    errors: unknown[] = [],
    stack: string = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.success = false;
    this.isOperational = true;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };