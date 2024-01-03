import { Body, Controller, HttpCode, Post } from "@nestjs/common";

import { ForgotPasswordDTO, LoginDTO, ResetPasswordDTO, SignupDTO } from "./auth.dto";
import AuthService from "./auth.service";

@Controller("auth")
export default class AuthController {
   constructor(private readonly authService: AuthService) {}

   @Post("signup")
   signup(@Body() body: SignupDTO) {
      return this.authService.signup({ body, statusCode: 201 });
   }

   @HttpCode(200)
   @Post("login")
   login(@Body() body: LoginDTO) {
      return this.authService.login({ body, statusCode: 200 });
   }

   @HttpCode(200)
   @Post("forgot-password")
   forgotPassword(@Body() body: ForgotPasswordDTO) {
      return this.authService.forgotPassword({ body, statusCode: 200 });
   }

   @HttpCode(200)
   @Post("reset-password")
   resetPassword(@Body() body: ResetPasswordDTO) {
      return this.authService.resetPassword({ body, statusCode: 200 });
   }
}
