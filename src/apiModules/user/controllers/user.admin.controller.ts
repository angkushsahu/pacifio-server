import { Body, Controller, Delete, Get, HttpCode, Param, Put, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import UserAdminService from "../services/user.admin.service";
import { GetAllUsersDTO, UserRoleDTO } from "../user.dto";
import { Roles, UserRoleGuard } from "src/userRoleCheck";
import { IdParam } from "src/apiModules/common.dto";

@Controller("user/admin")
export default class UserAdminController {
   constructor(private readonly userAdminService: UserAdminService) {}

   @HttpCode(200)
   @Roles("admin", "super-admin")
   @UseGuards(AuthGuard("jwt"), UserRoleGuard)
   @Get("all")
   getAllUsers(@Query() queryParams: GetAllUsersDTO) {
      return this.userAdminService.getAllUsers({ queryParams, statusCode: 200, resultsPerPage: 8 });
   }

   @HttpCode(200)
   @Roles("admin", "super-admin")
   @UseGuards(AuthGuard("jwt"), UserRoleGuard)
   @Get("info")
   userInfo() {
      return this.userAdminService.userInfo({ statusCode: 200 });
   }

   @HttpCode(200)
   @Roles("admin", "super-admin")
   @UseGuards(AuthGuard("jwt"), UserRoleGuard)
   @Get(":id")
   getUser(@Param() params: IdParam) {
      return this.userAdminService.getUser({ params, statusCode: 200 });
   }

   @HttpCode(200)
   @Roles("super-admin")
   @UseGuards(AuthGuard("jwt"), UserRoleGuard)
   @Put(":id")
   updateRole(@Body() request: UserRoleDTO, @Param() params: IdParam) {
      return this.userAdminService.updateRole({ params, role: request.role, statusCode: 200 });
   }

   @HttpCode(200)
   @Roles("admin", "super-admin")
   @UseGuards(AuthGuard("jwt"), UserRoleGuard)
   @Delete(":id")
   deleteUser(@Param() params: IdParam) {
      return this.userAdminService.deleteUser({ params, statusCode: 200 });
   }
}
