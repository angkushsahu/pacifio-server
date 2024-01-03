import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { ROLES_KEY } from "./userRole.decorator";
import { ErrorHandler } from "src/exceptions";

@Injectable()
export default class UserRoleGuard implements CanActivate {
   constructor(private readonly reflector: Reflector) {}

   canActivate(context: ExecutionContext): boolean | Promise<boolean> {
      const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);

      if (!requiredRoles) return true;

      const request = context.switchToHttp().getRequest();
      const { user } = request;

      if (!user || !requiredRoles.includes(user.role))
         throw new ErrorHandler({ message: "You are not authorized to access this resource", statusCode: 403 });

      return true;
   }
}
