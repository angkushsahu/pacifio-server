import { InjectModel } from "@nestjs/mongoose";
import { Injectable } from "@nestjs/common";

import { LoginDTO, SignupDTO } from "./auth.dto";
import { type IUserModel, USER_MODEL } from "src/models";
import { ErrorHandler } from "src/exceptions";

@Injectable()
export default class AuthService {
   constructor(@InjectModel(USER_MODEL) private readonly userModel: IUserModel) {}

   async signup({ body, statusCode }: { body: SignupDTO; statusCode: number }) {
      try {
         const { email, name, password } = body;
         const userExists = await this.userModel.findOne({ email });
         if (userExists) throw new ErrorHandler({ message: "E-mail already exists, login instead", statusCode: 409 });

         const user = await this.userModel.create({ name, email, password });
         return { success: true, message: "User registered successfully", data: { user: user.getUser() }, statusCode };
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: 500 });
      }
   }

   async login({ body, statusCode }: { body: LoginDTO; statusCode: number }) {
      try {
         const { email, password } = body;
         const user = await this.userModel.findOne({ email });
         if (!user) throw new ErrorHandler({ message: "User not registered, signup instead", statusCode: 404 });

         const arePasswordsMatching = await user.comparePassword(password);
         if (!arePasswordsMatching) throw new ErrorHandler({ message: "Invalid credentials", statusCode: 400 });

         return { success: true, message: "Login successful", data: { user: user.getUser() }, statusCode };
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: 500 });
      }
   }
}
