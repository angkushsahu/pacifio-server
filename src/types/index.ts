import { Request } from "express";
// import { UserDocument } from "src/schema/user.schema";

export interface IDecodedToken {
   id: string;
   iat: number;
   exp: number;
}

// export type CustomRequest = Request & { user: UserDocument };
