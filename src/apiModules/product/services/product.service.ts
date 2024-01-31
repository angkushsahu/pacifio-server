import { InjectModel } from "@nestjs/mongoose";
import type { PipelineStage } from "mongoose";
import { Injectable } from "@nestjs/common";

import { type IProductModel, PRODUCT_MODEL } from "src/models/product.model";
import { ProductSearchDTO } from "../product.dto";
import { ErrorHandler } from "src/exceptions";
import type { IStatusCode } from "src/types";

@Injectable()
export default class ProductService {
   constructor(@InjectModel(PRODUCT_MODEL) private readonly productModel: IProductModel) {}

   async getProduct({ statusCode, id }: IStatusCode & { id: string }) {
      try {
         const product = await this.productModel.findById(id);
         if (!product) throw new ErrorHandler({ message: "Product not found", statusCode: 404 });
         return { success: true, message: "Product found successfully", statusCode, data: { product: product.getProduct() } };
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: error.statusCode || 500 });
      }
   }

   async getAllProducts({
      resultsPerPage,
      statusCode,
      queryParams,
   }: IStatusCode & { queryParams: ProductSearchDTO; resultsPerPage: number }) {
      try {
         let { category, page, price_gte, price_lte, query, rating_gte, rating_lte } = queryParams;
         const pipeline: Array<PipelineStage> = [];

         if (query) {
            const regexQueryPattern = new RegExp(query, "i");
            // if the user does not filter through category, then both product name and categories are being searched
            if (!category) {
               const categoryQuery = `.*${[...query].join(".*")}.*`;
               const categoryRegexPattern = new RegExp(categoryQuery, "i");
               pipeline.push({ $match: { $or: [{ name: regexQueryPattern }, { category: categoryRegexPattern }] } });
            } else pipeline.push({ $match: { name: regexQueryPattern } });
         }

         if (!page) page = 1;
         if (category) {
            if (typeof category === "string") category = [category];
            pipeline.push({ $match: { category: { $in: category } } });
         }

         if (!price_gte) price_gte = 0;
         if (!price_lte) {
            const costliestProduct = await this.productModel.aggregate([{ $sort: { price: -1 } }, { $limit: 1 }]);
            price_lte = costliestProduct[0]?.price || 1000000;
         }

         if (!rating_gte) rating_gte = 0;
         if (!rating_lte) rating_lte = 5;

         pipeline.push({
            $match: {
               "rating.averageRating": { $gte: rating_gte, $lte: rating_lte },
               price: { $gte: price_gte, $lte: price_lte },
            },
         });

         pipeline.push({
            $facet: {
               count: [{ $count: "totalProducts" }],
               products: [
                  { $project: { _id: 0, id: "$_id", category: 1, defaultImage: 1, name: 1, price: 1, rating: 1, stock: 1 } },
                  { $skip: resultsPerPage * (page - 1) },
                  { $limit: resultsPerPage },
               ],
            },
         });

         const queryResult = await this.productModel.aggregate(pipeline);
         const { products, count } = queryResult[0];
         if (!products) throw new ErrorHandler({ message: "Unable to find products", statusCode: 500 });

         const totalProducts = count[0]?.totalProducts || 0;
         const totalPages = Math.ceil(totalProducts / resultsPerPage);

         return {
            success: true,
            message: "Products found successfully",
            statusCode,
            data: { totalProducts, totalPages, numberOfFetchedProducts: products.length, products },
         };
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: error.statusCode || 500 });
      }
   }

   async getHighestRatedProducts({ statusCode }: IStatusCode) {
      try {
         let products = await this.productModel.aggregate([
            { $sort: { "rating.averageRating": -1 } },
            { $group: { _id: "$category", highestRatedProduct: { $first: "$$ROOT" } } },
            { $replaceRoot: { newRoot: "$highestRatedProduct" } },
            { $project: { _id: 0, id: "$_id", category: 1, defaultImage: 1, name: 1, price: 1, rating: 1, stock: 1 } },
         ]);
         if (!products) throw new ErrorHandler({ message: "Unable to find highest-rated products", statusCode: 500 });

         const totalProducts = products.length;

         return {
            success: true,
            message: "Highest-rated products found successfully",
            statusCode,
            data: { totalProducts, totalPages: 1, numberOfFetchedProducts: totalProducts, products },
         };
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: error.statusCode || 500 });
      }
   }
}
