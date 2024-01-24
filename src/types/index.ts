import type { Request } from "express";

import type { IUserDocument } from "src/models";

export interface IDecodedToken {
   id: string;
   iat: number;
   exp: number;
}

export type CustomRequest = Request & { user: IUserDocument };

export type UserRoles = "user" | "admin" | "super-admin";

export interface UserServiceArgs {
   user: IUserDocument;
}

export interface IStatusCode {
   statusCode: number;
}
