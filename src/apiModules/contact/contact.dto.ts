import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class ContactDTO {
   @IsString()
   @IsNotEmpty()
   name: string;

   @IsString()
   @IsEmail()
   @IsNotEmpty()
   email: string;

   @IsString()
   @IsNotEmpty()
   subject: string;

   @IsString()
   @IsNotEmpty()
   message: string;
}
