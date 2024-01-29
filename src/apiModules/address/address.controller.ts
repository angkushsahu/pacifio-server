import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import type { CustomRequest } from "src/types";
import AddressService from "./address.service";
import { AddressDTO } from "./address.dto";
import { IdParam } from "../common.dto";

@Controller("address")
export default class AddressController {
   constructor(private readonly addressService: AddressService) {}

   @HttpCode(201)
   @UseGuards(AuthGuard("jwt"))
   @Post("create")
   createAddress(@Req() request: CustomRequest, @Body() addressBody: AddressDTO) {
      return this.addressService.createAddress({ user: request.user, statusCode: 201, addressBody });
   }

   @HttpCode(200)
   @UseGuards(AuthGuard("jwt"))
   @Get("all")
   getAllAddress(@Req() request: CustomRequest) {
      return this.addressService.getAllAddress({ user: request.user, statusCode: 200 });
   }

   @HttpCode(200)
   @UseGuards(AuthGuard("jwt"))
   @Get(":id")
   getAddress(@Req() request: CustomRequest, @Param() params: IdParam) {
      return this.addressService.getAddress({ user: request.user, statusCode: 200, id: params.id });
   }

   @HttpCode(200)
   @UseGuards(AuthGuard("jwt"))
   @Put(":id")
   updateAddress(@Req() request: CustomRequest, @Body() addressBody: AddressDTO, @Param() params: IdParam) {
      return this.addressService.updateAddress({ user: request.user, statusCode: 200, id: params.id, addressBody });
   }

   @HttpCode(200)
   @UseGuards(AuthGuard("jwt"))
   @Delete(":id")
   deleteAddress(@Req() request: CustomRequest, @Param() params: IdParam) {
      return this.addressService.deleteAddress({ user: request.user, statusCode: 200, id: params.id });
   }
}
