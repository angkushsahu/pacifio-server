import { SetMetadata } from "@nestjs/common";

import type { UserRoles } from "src/types";

export const ROLES_KEY = "roles";

export function Roles(...roles: Array<UserRoles>) {
   const uniqueRoles = [...new Set(roles)];
   return SetMetadata(ROLES_KEY, uniqueRoles);
}
