import { Body, Controller, HttpCode, Post } from "@nestjs/common";

import { LoginDTO, SignupDTO } from "./auth.dto";
import AuthService from "./auth.service";

@Controller("auth")
export default class AuthController {
   private readonly signupStatusCode = 201;
   private readonly loginStatusCode = 200;
   private readonly forgotPasswordStatusCode = 200;
   private readonly resetPasswordStatusCode = 200;

   constructor(private readonly authService: AuthService) {}

   @Post("signup")
   async signup(@Body() body: SignupDTO) {
      return this.authService.signup({ body, statusCode: this.signupStatusCode });
   }

   @HttpCode(200)
   @Post("login")
   async login(@Body() body: LoginDTO) {
      return this.authService.login({ body, statusCode: this.loginStatusCode });
   }
}
