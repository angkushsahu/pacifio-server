import { InjectModel } from "@nestjs/mongoose";
import type { PipelineStage } from "mongoose";
import { Injectable } from "@nestjs/common";

import { type IOrderModel, ORDER_MODEL, type IUserModel, USER_MODEL } from "src/models";
import { PaginationAndQueryDTO } from "src/apiModules/common.dto";
import { OrderAdminSearchDTO } from "../order.dto";
import { ErrorHandler } from "src/exceptions";
import type { IStatusCode } from "src/types";

@Injectable()
export default class OrderAdminService {
   constructor(
      @InjectModel(ORDER_MODEL) private readonly orderModel: IOrderModel,
      @InjectModel(USER_MODEL) private readonly userModel: IUserModel
   ) {}

   async getOrder({ orderId, statusCode }: { orderId: string } & IStatusCode) {
      try {
         const order = await this.orderModel.findById(orderId);
         if (!order) throw new ErrorHandler({ message: "Order not found", statusCode: 404 });

         const user = await this.userModel.findById(order.user);
         if (!user) throw new ErrorHandler({ message: "User not found", statusCode: 404 });

         return {
            success: true,
            message: "Order found successfully",
            statusCode,
            data: { order: order.getOrder(user.getUser()) },
         };
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: error.statusCode || 500 });
      }
   }

   async updateDeliveryStatus({ orderId, statusCode }: { orderId: string } & IStatusCode) {
      try {
         const order = await this.orderModel.findById(orderId);
         if (!order) throw new ErrorHandler({ message: "Order not found", statusCode: 404 });

         const user = await this.userModel.findById(order.user);
         if (!user) throw new ErrorHandler({ message: "User not found", statusCode: 404 });

         if (order.deliveryInfo.status === "delivered")
            throw new ErrorHandler({ message: "Order already delivered, cannot update any further", statusCode: 400 });
         else if (order.deliveryInfo.status === "processing") order.deliveryInfo.status = "shipped";
         else {
            order.deliveryInfo.status = "delivered";
            order.deliveryInfo.time = new Date();
         }

         await order.save();
         return {
            success: true,
            message: "Order updated successfully",
            statusCode,
            data: { order: order.getOrder(user.getUser()) },
         };
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: error.statusCode || 500 });
      }
   }

   async getAllOrders({
      resultsPerPage,
      statusCode,
      queryParams,
   }: IStatusCode & { queryParams: OrderAdminSearchDTO; resultsPerPage: number }) {
      try {
         let { page, query, status } = queryParams;
         const pipeline: Array<PipelineStage> = [];

         if (query) {
            query = `.*${[...query].join(".*")}.*`;
            const regexQueryPattern = new RegExp(query, "i");
            pipeline.push({ $match: { $or: [{ "user.name": regexQueryPattern }, { "user.email": regexQueryPattern }] } });
         }

         if (status) pipeline.push({ $match: { "deliveryInfo.status": status } });
         pipeline.push({ $sort: { createdAt: -1 } });

         pipeline.push({ $lookup: { from: "users", localField: "user", foreignField: "_id", as: "user" } });
         pipeline.push({
            $project: {
               _id: 0,
               id: "$_id",
               user: { name: 1, email: 1, role: 1, id: "$_id", createdAt: 1 },
               address: 1,
               deliveryInfo: 1,
               paymentInfo: 1,
               totalPrice: 1,
               products: 1,
               createdAt: 1,
            },
         });
         pipeline.push({ $addFields: { user: { $arrayElemAt: ["$user", 0] } } });
         if (!page) page = 1;

         pipeline.push({
            $facet: {
               count: [{ $count: "totalOrders" }],
               orders: [{ $skip: resultsPerPage * (page - 1) }, { $limit: resultsPerPage }],
            },
         });

         const queryResult = await this.orderModel.aggregate(pipeline);
         const { orders, count } = queryResult[0];
         if (!orders) throw new ErrorHandler({ message: "Unable to find orders", statusCode: 500 });

         const totalOrders = count[0]?.totalOrders || 0;

         return {
            success: true,
            message: "Orders found successfully",
            statusCode,
            data: { totalOrders, numberOfFetchedOrders: orders.length, orders },
         };
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: error.statusCode || 500 });
      }
   }

   async getAllTransactions({
      resultsPerPage,
      statusCode,
      queryParams,
   }: IStatusCode & { queryParams: PaginationAndQueryDTO; resultsPerPage: number }) {
      try {
         let { page, query } = queryParams;
         const pipeline: Array<PipelineStage> = [];

         if (query) {
            query = `.*${[...query].join(".*")}.*`;
            const regexQueryPattern = new RegExp(query, "i");
            pipeline.push({ $match: { $or: [{ "user.name": regexQueryPattern }, { "user.email": regexQueryPattern }] } });
         }

         pipeline.push({ $sort: { createdAt: -1 } });

         pipeline.push({ $lookup: { from: "users", localField: "user", foreignField: "_id", as: "user" } });
         pipeline.push({
            $project: {
               _id: 0,
               id: "$_id",
               user: { name: 1, email: 1, role: 1, id: "$_id", createdAt: 1 },
               address: 1,
               deliveryInfo: 1,
               paymentInfo: 1,
               totalPrice: 1,
               products: 1,
               createdAt: 1,
            },
         });
         pipeline.push({ $addFields: { user: { $arrayElemAt: ["$user", 0] } } });
         if (!page) page = 1;

         pipeline.push({
            $facet: {
               count: [{ $count: "totalOrders" }],
               orders: [{ $skip: resultsPerPage * (page - 1) }, { $limit: resultsPerPage }],
            },
         });

         const queryResult = await this.orderModel.aggregate(pipeline);
         const { orders, count } = queryResult[0];
         if (!orders) throw new ErrorHandler({ message: "Unable to find orders", statusCode: 500 });

         const totalOrders = count[0]?.totalOrders || 0;

         return {
            success: true,
            message: "Transactions found successfully",
            statusCode,
            data: { totalOrders, numberOfFetchedOrders: orders.length, orders },
         };
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: error.statusCode || 500 });
      }
   }
}
