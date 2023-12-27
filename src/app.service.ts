import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
   getHello(): string {
      return "Creating Pacifio from scratch";
   }
}
