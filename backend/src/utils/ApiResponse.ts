
class ApiResponse<T = unknown> {
  statusCode: number;
  message: string;
  data: T;
  success: boolean;

  constructor(statusCode: number, message: string = "success", data: T = {} as T) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.success = true;
  }
}

export { ApiResponse };