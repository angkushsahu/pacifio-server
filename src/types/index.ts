import { Request } from "express";

import type { IUserDocument } from "src/models/user.model";

export interface IDecodedToken {
   id: string;
   iat: number;
   exp: number;
}

export type CustomRequest = Request & { user: IUserDocument };

export interface UserServiceArgs {
   user: IUserDocument;
}

export interface IStatusCode {
   statusCode: number;
}
