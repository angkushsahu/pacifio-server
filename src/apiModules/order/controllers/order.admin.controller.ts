import { Controller, Get, HttpCode, Param, Put, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { IdParam, PaginationAndQueryDTO } from "src/apiModules/common.dto";
import OrderAdminService from "../services/order.admin.service";
import { Roles, UserRoleGuard } from "src/userRoleCheck";
import { OrderAdminSearchDTO } from "../order.dto";

@Controller("order/admin")
export default class OrderAdminController {
   constructor(private readonly orderAdminService: OrderAdminService) {}

   @HttpCode(200)
   @Roles("admin", "super-admin")
   @UseGuards(AuthGuard("jwt"), UserRoleGuard)
   @Get("all")
   getAllOrders(@Query() queryParams: OrderAdminSearchDTO) {
      return this.orderAdminService.getAllOrders({ queryParams, resultsPerPage: 8, statusCode: 200 });
   }

   @HttpCode(200)
   @Roles("admin", "super-admin")
   @UseGuards(AuthGuard("jwt"), UserRoleGuard)
   @Get(":id")
   getOrder(@Param() params: IdParam) {
      return this.orderAdminService.getOrder({ orderId: params.id, statusCode: 200 });
   }

   @HttpCode(200)
   @Roles("admin", "super-admin")
   @UseGuards(AuthGuard("jwt"), UserRoleGuard)
   @Put(":id/update-delivery-status")
   updateDeliveryStatus(@Param() params: IdParam) {
      return this.orderAdminService.updateDeliveryStatus({ orderId: params.id, statusCode: 200 });
   }

   @HttpCode(200)
   @Roles("admin", "super-admin")
   @UseGuards(AuthGuard("jwt"), UserRoleGuard)
   @Get("transactions/all")
   getAllTransactions(@Query() queryParams: PaginationAndQueryDTO) {
      return this.orderAdminService.getAllTransactions({ queryParams, resultsPerPage: 8, statusCode: 200 });
   }
}
