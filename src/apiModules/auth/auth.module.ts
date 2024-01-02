import { JwtModule } from "@nestjs/jwt";
import { Module } from "@nestjs/common";

import AuthController from "./auth.controller";
import AuthService from "./auth.service";

@Module({
   imports: [JwtModule.register({ secret: process.env.JWT_SECRET })],
   controllers: [AuthController],
   providers: [AuthService],
})
export default class AuthModule {}
