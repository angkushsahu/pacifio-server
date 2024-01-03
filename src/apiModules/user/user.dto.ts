import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class UpdateUserDTO {
   @IsString()
   @IsNotEmpty()
   name: string;

   @IsString()
   @IsNotEmpty()
   @IsEmail()
   email: string;
}

export class ChangePasswordDTO {
   @IsString()
   @IsNotEmpty()
   password: string;
}
