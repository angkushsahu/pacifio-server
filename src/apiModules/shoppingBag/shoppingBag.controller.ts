import { Body, Controller, Delete, Get, HttpCode, Param, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import ShoppingBagService from "./shoppingBag.service";
import { ShoppingBagDTO } from "./shoppingBag.dto";
import type { CustomRequest } from "src/types";
import { IdParam } from "../common.dto";

@Controller("shopping-bag")
export default class ShoppingBagController {
   constructor(private readonly shoppingBagService: ShoppingBagService) {}

   @HttpCode(200)
   @UseGuards(AuthGuard("jwt"))
   @Get()
   getShoppingBag(@Req() request: CustomRequest) {
      return this.shoppingBagService.getShoppingBag({ statusCode: 200, user: request.user });
   }

   @HttpCode(200)
   @UseGuards(AuthGuard("jwt"))
   @Post("add")
   addProductToBag(@Req() request: CustomRequest, @Body() body: ShoppingBagDTO) {
      return this.shoppingBagService.addProductToBag({ body, statusCode: 200, user: request.user });
   }

   @HttpCode(200)
   @UseGuards(AuthGuard("jwt"))
   @Delete(":id")
   removeProductFromBag(@Req() request: CustomRequest, @Param() params: IdParam) {
      return this.shoppingBagService.removeProductFromBag({ productId: params.id, statusCode: 200, user: request.user });
   }
}
