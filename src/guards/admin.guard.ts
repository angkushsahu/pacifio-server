import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";

@Injectable()
export default class AdminGuard implements CanActivate {
   canActivate(context: ExecutionContext): boolean | Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const user = request.user;

      if (user && user.role === "admin") {
         return true;
      }

      throw new ForbiddenException("Forbidden - Insufficient Role");
   }
}
