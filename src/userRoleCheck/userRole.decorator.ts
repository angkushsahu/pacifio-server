import { SetMetadata } from "@nestjs/common";

export const ROLES_KEY = "roles";
export type AllowedRolesType = "admin" | "super-admin" | "user";

export function Roles(...roles: Array<AllowedRolesType>) {
   const uniqueRoles = [...new Set(roles)];
   return SetMetadata(ROLES_KEY, uniqueRoles);
}
