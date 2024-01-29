import { Controller, Get, HttpCode, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import OrderVisualizationService from "../services/order.visualize.service";
import { Roles, UserRoleGuard } from "src/userRoleCheck";

@Controller("order/admin")
export default class OrderVisualizationController {
   constructor(private readonly orderVisualizationService: OrderVisualizationService) {}

   @HttpCode(200)
   @Roles("admin", "super-admin")
   @UseGuards(AuthGuard("jwt"), UserRoleGuard)
   @Get("graph-data")
   graphData() {
      return this.orderVisualizationService.graphData({ statusCode: 200 });
   }

   @HttpCode(200)
   @Roles("admin", "super-admin")
   @UseGuards(AuthGuard("jwt"), UserRoleGuard)
   @Get("transaction-info")
   transactionInfo() {
      return this.orderVisualizationService.transactionInfo({ statusCode: 200 });
   }

   @HttpCode(200)
   @Roles("admin", "super-admin")
   @UseGuards(AuthGuard("jwt"), UserRoleGuard)
   @Get("info")
   orderInfo() {
      return this.orderVisualizationService.orderInfo({ statusCode: 200 });
   }

   @HttpCode(200)
   @Roles("admin", "super-admin")
   @UseGuards(AuthGuard("jwt"), UserRoleGuard)
   @Get("recent")
   recentSales() {
      return this.orderVisualizationService.recentSales({ statusCode: 200, totalResults: 5 });
   }
}
