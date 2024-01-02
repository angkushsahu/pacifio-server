import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export default class AuthGuard implements CanActivate {
   constructor(private readonly jwtService: JwtService) {}

   canActivate(context: ExecutionContext): boolean | Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const token = request.headers.authorization?.replace("Bearer ", "");

      if (!token) {
         throw new UnauthorizedException("Unauthorized - Missing Token");
      }

      try {
         const decodedUser = this.jwtService.verify(token);
         request.user = decodedUser;
         return true;
      } catch (error) {
         throw new UnauthorizedException("Unauthorized - Invalid Token");
      }
   }
}
