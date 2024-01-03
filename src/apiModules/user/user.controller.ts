import { Body, Controller, Delete, Get, HttpCode, Put, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { ChangePasswordDTO, UpdateUserDTO } from "./user.dto";
import type { CustomRequest } from "src/types";
import UserService from "./user.service";

@Controller("user")
export default class UserController {
   constructor(private readonly userService: UserService) {}

   @HttpCode(200)
   @UseGuards(AuthGuard("jwt"))
   @Get()
   getUser(@Req() request: CustomRequest) {
      return { success: true, message: "User found successfully", statusCode: 200, data: { user: request.user.getUser() } };
   }

   @HttpCode(200)
   @UseGuards(AuthGuard("jwt"))
   @Put("change-password")
   changePassword(@Req() request: CustomRequest, @Body() body: ChangePasswordDTO) {
      return this.userService.changePassword({ body, statusCode: 200, user: request.user });
   }

   @HttpCode(200)
   @UseGuards(AuthGuard("jwt"))
   @Put()
   updateUser(@Req() request: CustomRequest, @Body() body: UpdateUserDTO) {
      return this.userService.updateUser({ body, statusCode: 200, user: request.user });
   }

   @HttpCode(200)
   @UseGuards(AuthGuard("jwt"))
   @Delete()
   deleteUser(@Req() request: CustomRequest) {
      return this.userService.deleteUser({ user: request.user, statusCode: 200 });
   }
}
