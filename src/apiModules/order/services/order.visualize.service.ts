import { InjectModel } from "@nestjs/mongoose";
import type { PipelineStage } from "mongoose";
import { Injectable } from "@nestjs/common";

import { type IOrderModel, ORDER_MODEL } from "src/models";
import { ErrorHandler } from "src/exceptions";
import type { IStatusCode } from "src/types";

@Injectable()
export default class OrderVisualizationService {
   constructor(@InjectModel(ORDER_MODEL) private readonly orderModel: IOrderModel) {}

   private readonly monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

   async graphData({ statusCode }: IStatusCode) {
      try {
         const twelveMonthsData = new Date();
         twelveMonthsData.setMonth(twelveMonthsData.getMonth() - 11);
         twelveMonthsData.setDate(1);
         twelveMonthsData.setHours(0);
         twelveMonthsData.setMinutes(0);
         twelveMonthsData.setSeconds(0);

         // Sales contains all the totalSales returned from each month for the past 12 months, however, it ignores the months with totalSales = 0
         const sales: Array<{ _id: number; totalSales: number }> = await this.orderModel.aggregate([
            { $match: { createdAt: { $gte: twelveMonthsData } } },
            { $group: { _id: { $month: "$createdAt" }, totalSales: { $sum: "$totalPrice" } } },
            { $sort: { _id: 1 } },
         ]);

         // the array below contains all the totalSales value from 0 to 11 (length: 12) where the sales._id represent array index
         const unsortedSalesMap = Array.from({ length: 12 }).map(() => 0);
         sales.map((val) => (unsortedSalesMap[val._id - 1] = val.totalSales));

         // the array above contains the values from jan to dec, not in the order of the current
         const currentMonthIndex = twelveMonthsData.getMonth();
         const monthlySales: Array<{ name: string; total: number }> = [];
         for (let i = currentMonthIndex; i < 12; i++) monthlySales.push({ name: this.monthNames[i], total: unsortedSalesMap[i] });
         for (let i = 0; i < currentMonthIndex; i++) monthlySales.push({ name: this.monthNames[i], total: unsortedSalesMap[i] });

         return {
            success: true,
            message: "Found total transactions successfully",
            statusCode,
            data: { monthlySales },
         };
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: error.statusCode || 500 });
      }
   }

   async transactionInfo({ statusCode }: IStatusCode) {
      try {
         const sales = await this.orderModel.aggregate([
            { $group: { _id: null, totalSales: { $sum: "$totalPrice" }, totalTransactions: { $sum: 1 } } },
         ]);
         const { totalTransactions, totalSales } = sales[0];
         const averageTransactions = totalTransactions !== 0 ? Number((totalSales / totalTransactions).toFixed(2)) : 0;

         return {
            success: true,
            message: "Found total transactions successfully",
            statusCode,
            data: { totalTransactions, totalSales, averageTransactions },
         };
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: error.statusCode || 500 });
      }
   }

   async orderInfo({ statusCode }: IStatusCode) {
      try {
         const sales = await this.orderModel.aggregate([{ $group: { _id: "$deliveryInfo.status", count: { $sum: 1 } } }]);

         const orderGroup = { processing: 0, shipped: 0, delivered: 0 };
         let totalOrders = 0;
         sales.map((sale) => {
            orderGroup[sale._id] = sale.count;
            totalOrders += sale.count;
         });

         return { success: true, message: "Found total sales successfully", statusCode, data: { totalOrders, orderGroup } };
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: error.statusCode || 500 });
      }
   }

   async recentSales({ statusCode, totalResults }: { totalResults: number } & IStatusCode) {
      try {
         const pipeline: Array<PipelineStage> = [];

         pipeline.push({ $sort: { createdAt: -1 } });

         pipeline.push({ $lookup: { from: "users", localField: "user", foreignField: "_id", as: "user" } });
         pipeline.push({
            $project: {
               _id: 0,
               id: "$_id",
               user: { name: 1, email: 1, id: "$_id" },
               totalPrice: 1,
               createdAt: 1,
            },
         });

         pipeline.push({ $addFields: { user: { $arrayElemAt: ["$user", 0] } } });

         pipeline.push({ $facet: { orders: [{ $limit: totalResults }] } });

         const queryResult = await this.orderModel.aggregate(pipeline);
         const { orders } = queryResult[0];
         if (!orders) throw new ErrorHandler({ message: "Unable to find orders", statusCode: 500 });

         const totalPriceOfRecentSales = orders.reduce((sum, order) => sum + order.totalPrice, 0);

         return {
            success: true,
            message: "Recent Orders found successfully",
            statusCode,
            data: { totalOrders: orders.length, totalPriceOfRecentSales, orders },
         };
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: error.statusCode || 500 });
      }
   }
}
