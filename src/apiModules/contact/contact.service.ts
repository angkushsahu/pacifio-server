import { Injectable } from "@nestjs/common";

import { ErrorHandler } from "src/exceptions";
import { contactMail } from "src/mailService";
import type { IStatusCode } from "src/types";
import { ContactDTO } from "./contact.dto";

@Injectable()
export default class ContactService {
   async sendMail({ body, statusCode }: { body: ContactDTO } & IStatusCode) {
      try {
         const { message, success } = await contactMail(body);
         if (!success) throw new ErrorHandler({ message, statusCode: 500 });
         return { success: true, message, statusCode };
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: error.statusCode || 500 });
      }
   }
}
