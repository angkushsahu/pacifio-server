import { HttpException } from "@nestjs/common";

export interface ErrorHandlerParams {
   message: string | string[];
   statusCode: number;
}

export default class ErrorHandler extends HttpException {
   statusCode: number = 500;
   constructor({ message = "Internal server error", statusCode = 500 }: ErrorHandlerParams) {
      super(message, statusCode);
      this.statusCode = statusCode;

      Error.captureStackTrace(this, this.constructor);
   }
}
