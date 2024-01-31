import { InjectModel } from "@nestjs/mongoose";
import type { PipelineStage } from "mongoose";
import { Injectable } from "@nestjs/common";

import type { IUserModel, IAddressModel, IShoppingBagModel } from "src/models";
import { USER_MODEL, SHOPPING_BAG_MODEL, ADDRESS_MODEL } from "src/models";
import type { IStatusCode, UserRoles } from "src/types";
import { IdParam } from "src/apiModules/common.dto";
import { ErrorHandler } from "src/exceptions";
import { GetAllUsersDTO } from "../user.dto";

@Injectable()
export default class UserAdminService {
   constructor(
      @InjectModel(USER_MODEL) private readonly userModel: IUserModel,
      @InjectModel(ADDRESS_MODEL) private readonly addressModel: IAddressModel,
      @InjectModel(SHOPPING_BAG_MODEL) private readonly shoppingBagModel: IShoppingBagModel
   ) {}

   async getAllUsers({
      queryParams,
      statusCode,
      resultsPerPage,
   }: { queryParams: GetAllUsersDTO; resultsPerPage: number } & IStatusCode) {
      try {
         let { page, query, role } = queryParams;
         const pipeline: Array<PipelineStage> = [];

         if (!role) role = "user";
         pipeline.push({ $match: { role } });

         if (!page) page = 1;
         if (query) {
            query = `.*${[...query].join(".*")}.*`;
            const regexQueryPattern = new RegExp(query, "i");
            pipeline.push({ $match: { $or: [{ name: regexQueryPattern }, { email: regexQueryPattern }] } });
         }

         pipeline.push({
            $facet: {
               count: [{ $count: "totalUsers" }],
               users: [
                  { $project: { _id: 0, id: "$_id", name: 1, email: 1, role: 1, createdAt: 1 } },
                  { $skip: resultsPerPage * (page - 1) },
                  { $limit: resultsPerPage },
               ],
            },
         });

         const queryResult = await this.userModel.aggregate(pipeline);
         const { users, count } = queryResult[0];
         if (!users) throw new ErrorHandler({ message: "Unable to find users", statusCode: 500 });

         const totalUsers = count[0]?.totalUsers || 0;
         const totalPages = Math.ceil(totalUsers / resultsPerPage);

         return {
            success: true,
            message: "Users found successfully",
            statusCode,
            data: { totalUsers, totalPages, numberOfFetchedUsers: users.length, users },
         };
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: error.statusCode || 500 });
      }
   }

   async userInfo({ statusCode }: IStatusCode) {
      try {
         const users = await this.userModel.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]);

         const userGroup = { user: 0, admin: 0, "super-admin": 0 };
         let totalUsers = 0;
         users.map((user) => {
            userGroup[user._id] = user.count;
            totalUsers += user.count;
         });

         return {
            success: true,
            message: "Found user info successfully",
            statusCode,
            data: { totalUsers, userGroup },
         };
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: error.statusCode || 500 });
      }
   }

   async getUser({ params, statusCode }: { params: IdParam } & IStatusCode) {
      try {
         const user = await this.userModel.findById(params.id);
         if (!user) throw new ErrorHandler({ message: "User not found", statusCode: 404 });
         return { success: true, message: "User found successfully", statusCode, data: { user: user.getUser() } };
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: error.statusCode || 500 });
      }
   }

   async updateRole({ params, role, statusCode }: { params: IdParam; role: UserRoles } & IStatusCode) {
      try {
         const user = await this.userModel.findById(params.id);
         if (!user) throw new ErrorHandler({ message: "User not found", statusCode: 404 });

         if (user.role === "super-admin") throw new ErrorHandler({ message: "Forbidden action", statusCode: 403 });
         user.role = role;
         await user.save();

         return { success: true, message: "User updated successfully", statusCode, data: { user: user.getUser() } };
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: error.statusCode || 500 });
      }
   }

   async deleteUser({ params, statusCode }: { params: IdParam } & IStatusCode) {
      try {
         const user = await this.userModel.findById(params.id);
         if (!user) throw new ErrorHandler({ message: "User not found", statusCode: 404 });

         await this.addressModel.deleteMany({ user: user._id });
         await this.shoppingBagModel.deleteMany({ user: user._id });
         await user.deleteOne();

         return { success: true, message: "User deleted successfully", statusCode };
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: error.statusCode || 500 });
      }
   }
}
