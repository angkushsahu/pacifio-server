import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginDTO {
   @IsString()
   @IsNotEmpty()
   @IsEmail()
   email: string;

   @IsString()
   @IsNotEmpty()
   password: string;
}

export class SignupDTO extends LoginDTO {
   @IsString()
   @IsNotEmpty()
   name: string;
}
