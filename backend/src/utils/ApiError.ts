class ApiError extends Error {
  statusCode: number;
  errors?: unknown;              
  isOperational: boolean;
  data?: object | undefined;
  success:boolean;

  constructor(
    statusCode: number,
    message: string = "something went wrong",
    errors: unknown = [],
    data?: object,
    stack: string = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.success = false;
    this.isOperational = true;
    this.data = data;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };