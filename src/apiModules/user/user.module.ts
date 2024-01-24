import { Module } from "@nestjs/common";

import UserAdminController from "./controllers/user.admin.controller";
import UserAdminService from "./services/user.admin.service";
import UserController from "./controllers/user.controller";
import UserService from "./services/user.service";

@Module({
   controllers: [UserController, UserAdminController],
   providers: [UserService, UserAdminService],
})
export default class UserModule {}
