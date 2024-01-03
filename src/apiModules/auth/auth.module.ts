import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { Module } from "@nestjs/common";

import AuthController from "./auth.controller";
import { JwtStrategy } from "src/authStrategy";
import AuthService from "./auth.service";

@Module({
   imports: [PassportModule, JwtModule.register({ secret: process.env.JWT_SECRET })],
   controllers: [AuthController],
   providers: [AuthService, JwtStrategy],
})
export default class AuthModule {}
