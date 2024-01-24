import { Body, Controller, HttpCode, Post } from "@nestjs/common";

import ContactService from "./contact.service";
import { ContactDTO } from "./contact.dto";

@Controller("contact")
export default class ContactController {
   constructor(private readonly contactService: ContactService) {}

   @HttpCode(200)
   @Post()
   sendMail(@Body() body: ContactDTO) {
      return this.contactService.sendMail({ body, statusCode: 200 });
   }
}
