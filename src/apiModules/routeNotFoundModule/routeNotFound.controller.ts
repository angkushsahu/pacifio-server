import { Controller, Get, Req } from "@nestjs/common";
import type { Request } from "express";

import { ErrorHandler } from "src/exceptions";

@Controller()
export default class RouteNotFoundController {
   @Get("*")
   notFound(@Req() { route }: Request): string {
      throw new ErrorHandler({ message: `Route -> '${route.path}' does not exist`, statusCode: 404 });
   }
}
