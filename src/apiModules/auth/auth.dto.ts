import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class ResetPasswordDTO {
   @IsString()
   @IsNotEmpty()
   password: string;

   @IsString()
   @IsNotEmpty()
   resetId: string;
}

export class ForgotPasswordDTO {
   @IsString()
   @IsNotEmpty()
   @IsEmail()
   email: string;
}

export class LoginDTO extends ForgotPasswordDTO {
   @IsString()
   @IsNotEmpty()
   password: string;
}

export class SignupDTO extends LoginDTO {
   @IsString()
   @IsNotEmpty()
   name: string;
}
