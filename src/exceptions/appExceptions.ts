import { ExceptionFilter, Catch, ArgumentsHost, BadRequestException } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";

import ErrorHandler from "./errorHandler";

@Catch(ErrorHandler, BadRequestException)
export default class AppExceptionFilter implements ExceptionFilter {
   constructor(private httpAdapterHost: HttpAdapterHost) {}

   catch(error: any, host: ArgumentsHost) {
      const response = host.switchToHttp().getResponse();
      const { httpAdapter } = this.httpAdapterHost;

      if (error instanceof ErrorHandler) {
         const { statusCode, message } = error;

         httpAdapter.reply(response, { success: false, statusCode, message }, statusCode);
      } else {
         const { response: errorRes } = error;
         const { statusCode, message } = errorRes;

         httpAdapter.reply(response, { success: false, statusCode, message }, statusCode);
      }
   }
}
