import { Module } from "@nestjs/common";

import RouteNotFoundController from "./routeNotFound.controller";

@Module({
   controllers: [RouteNotFoundController],
})
export default class RouteNotFoundModule {}
