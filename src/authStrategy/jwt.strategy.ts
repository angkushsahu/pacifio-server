import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Injectable } from "@nestjs/common";
import { Request } from "express";

import AuthService from "src/apiModules/auth/auth.service";
import { ErrorHandler } from "src/exceptions";
import { IDecodedToken } from "src/types";

@Injectable()
export default class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
   constructor(private readonly userService: AuthService) {
      super({
         jwtFromRequest: ExtractJwt.fromExtractors([JwtStrategy.extractJWT]),
         ignoreExpiration: false,
         secretOrKey: process.env.JWT_SECRET,
      });
   }

   private static extractJWT(request: Request) {
      // if (request.cookies && `${process.env["TOKEN_NAME"]}` in request.cookies)
      //    return request.cookies[`${process.env["TOKEN_NAME"]}`]; // -- for setting cookies from the server
      const [type, token] = request.headers.authorization?.split(" ") ?? [];
      if (type === "Bearer" && token) return token;
      throw new ErrorHandler({ message: "Unauthorized - Missing Token", statusCode: 401 });
      return null;
   }

   async validate(payload: IDecodedToken) {
      try {
         const user = await this.userService.getUserByIdForPassportValidation(payload.id);
         if (!user) throw new ErrorHandler({ message: "Please login to access this resource", statusCode: 401 });
         return user;
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: 500 });
      }
   }
}
