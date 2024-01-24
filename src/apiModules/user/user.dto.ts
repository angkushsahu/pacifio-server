import { IsEmail, IsEnum, IsNotEmpty, IsString } from "class-validator";

import { PaginationAndQueryDTO } from "../common.dto";
import type { UserRoles } from "src/types";

export class UpdateUserDTO {
   @IsString()
   @IsNotEmpty()
   name: string;

   @IsString()
   @IsNotEmpty()
   @IsEmail()
   email: string;
}

export class ChangePasswordDTO {
   @IsString()
   @IsNotEmpty()
   password: string;
}

export class UserRoleDTO {
   @IsString()
   @IsNotEmpty()
   @IsEnum(["user", "admin", "super-admin"])
   role: UserRoles;
}

export class GetAllUsersDTO extends PaginationAndQueryDTO {
   @IsString()
   @IsNotEmpty()
   @IsEnum(["user", "admin", "super-admin"])
   role: UserRoles;
}
