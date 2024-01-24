import { InjectModel } from "@nestjs/mongoose";
import { Injectable } from "@nestjs/common";

import { ChangePasswordDTO, UpdateUserDTO } from "../user.dto";
import type { IStatusCode, UserServiceArgs } from "src/types";
import { type IUserModel, USER_MODEL } from "src/models";
import { ErrorHandler } from "src/exceptions";

@Injectable()
export default class UserService {
   constructor(@InjectModel(USER_MODEL) private readonly userModel: IUserModel) {}

   async changePassword({ body, statusCode, user }: UserServiceArgs & IStatusCode & { body: ChangePasswordDTO }) {
      try {
         user.password = body.password;
         await user.save();
         return { success: true, message: "Password updated successfully", statusCode };
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: error.statusCode || 500 });
      }
   }

   async updateUser({ body, statusCode, user }: UserServiceArgs & IStatusCode & { body: UpdateUserDTO }) {
      try {
         const { email, name } = body;
         if (user.name === name && user.email === email)
            return { success: true, message: "User updated successfully", statusCode, data: { user: user.getUser() } };

         const updatedUser = await this.userModel.findByIdAndUpdate(user.id, { name, email }, { new: true });
         if (!updatedUser) throw new ErrorHandler({ message: "User not found", statusCode: 404 });
         return { success: true, message: "User updated successfully", statusCode, data: { user: updatedUser.getUser() } };
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: error.statusCode || 500 });
      }
   }

   async deleteUser({ statusCode, user }: UserServiceArgs & IStatusCode) {
      try {
         await user.deleteOne();
         return { success: true, message: "User deleted successfully", statusCode };
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: error.statusCode || 500 });
      }
   }
}
