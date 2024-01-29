import { Body, Controller, Get, HttpCode, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { GetAllOrdersDTO, OrderProductsDTO } from "../order.dto";
import OrderService from "../services/order.service";
import { IdParam } from "src/apiModules/common.dto";
import type { CustomRequest } from "src/types";

@Controller("order")
export default class OrderController {
   constructor(private readonly orderService: OrderService) {}

   @HttpCode(201)
   @UseGuards(AuthGuard("jwt"))
   @Post("create")
   createOrder(@Req() request: CustomRequest, @Body() body: OrderProductsDTO) {
      return this.orderService.createOrder({ user: request.user, body, statusCode: 201 });
   }

   @HttpCode(200)
   @UseGuards(AuthGuard("jwt"))
   @Post("payment/:id")
   acceptPayment(@Req() request: CustomRequest, @Param() params: IdParam) {
      return this.orderService.acceptPayment({ user: request.user, orderId: params.id, statusCode: 200 });
   }

   @HttpCode(200)
   @UseGuards(AuthGuard("jwt"))
   @Get("all")
   getAllOrders(@Req() request: CustomRequest, @Query() queryParams: GetAllOrdersDTO) {
      return this.orderService.getAllOrders({ user: request.user, statusCode: 200, queryParams, resultsPerPage: 6 });
   }

   @HttpCode(200)
   @UseGuards(AuthGuard("jwt"))
   @Get(":id")
   getOrder(@Req() request: CustomRequest, @Param() params: IdParam) {
      return this.orderService.getOrder({ user: request.user, orderId: params.id, statusCode: 200 });
   }
}
