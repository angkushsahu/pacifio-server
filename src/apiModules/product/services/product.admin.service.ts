import { InjectModel } from "@nestjs/mongoose";
import type { PipelineStage } from "mongoose";
import { Injectable } from "@nestjs/common";

import { ProductAdminSearchDTO, ProductDTO, ProductImageDTO } from "../product.dto";
import { type IProductModel, PRODUCT_MODEL } from "src/models";
import { ErrorHandler } from "src/exceptions";
import type { IStatusCode } from "src/types";

@Injectable()
export default class ProductAdminService {
   constructor(@InjectModel(PRODUCT_MODEL) private readonly productModel: IProductModel) {}

   async createProduct({ productBody, statusCode }: IStatusCode & { productBody: ProductDTO }) {
      try {
         const newProductBody = structuredClone(productBody);
         if (productBody.images?.length) newProductBody["defaultImage"] = productBody.images[0];

         const product = await this.productModel.create(newProductBody);
         if (!product) throw new ErrorHandler({ message: "Unable to create product, please try again", statusCode: 500 });
         return { success: true, message: "Product created successfully", statusCode, data: { product: product.getProduct() } };
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: error.statusCode || 500 });
      }
   }

   async addProductImage({ productImage, statusCode, id }: IStatusCode & { productImage: ProductImageDTO; id: string }) {
      try {
         const product = await this.productModel.findById(id);
         if (!product) throw new ErrorHandler({ message: "Product not found", statusCode: 404 });

         if (product.images.length >= 4)
            throw new ErrorHandler({ message: "One product cannot have more than 4 images", statusCode: 400 });

         if (!product.defaultImage || !product.defaultImage.publicUrl || !product.defaultImage.secureUrl)
            product.defaultImage = productImage; // also if there is no default image, we set a new default image
         product.images.push(productImage);
         await product.save();
         return {
            success: true,
            message: "Image added successfully",
            statusCode,
            data: { product: product.getProduct(), image: productImage },
         };
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: error.statusCode || 500 });
      }
   }

   async deleteProductImage({ productImage, statusCode, id }: IStatusCode & { productImage: ProductImageDTO; id: string }) {
      try {
         const product = await this.productModel.findById(id);
         if (!product) throw new ErrorHandler({ message: "Product not found", statusCode: 404 });

         const { publicUrl, secureUrl } = productImage;
         const numberOfImagesBeforeDeletion = product.images.length;
         product.images = product.images.filter((image) => publicUrl !== image.publicUrl && secureUrl !== image.secureUrl);
         if (numberOfImagesBeforeDeletion === product.images.length)
            throw new ErrorHandler({ message: "Image not found", statusCode: 404 });

         // if the image that is being deleted is the defaultImage, then we check if there are any images left in the product model, if yes, then we set the first image as the new default image
         if (product.defaultImage.publicUrl === publicUrl && product.defaultImage.secureUrl === secureUrl) {
            if (product.images?.length) product.defaultImage = product.images[0];
            else product.defaultImage = { publicUrl: "", secureUrl: "" };
         }

         await product.save();
         return {
            success: true,
            message: "Image deleted successfully",
            statusCode,
            data: { product: product.getProduct(), image: productImage },
         };
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: error.statusCode || 500 });
      }
   }

   async setDefaultProductImage({ productImage, statusCode, id }: IStatusCode & { productImage: ProductImageDTO; id: string }) {
      try {
         const product = await this.productModel.findById(id);
         if (!product) throw new ErrorHandler({ message: "Product not found", statusCode: 404 });

         let condition = false;
         for (let i = 0; i < product.images.length; i++) {
            const image = product.images[i];
            if (image.publicUrl === productImage.publicUrl && image.secureUrl === productImage.secureUrl) {
               product.defaultImage = image;
               condition = true;
               break;
            }
         }

         if (!condition) throw new ErrorHandler({ message: "Image not found", statusCode: 404 });

         await product.save();
         return {
            success: true,
            message: "Default image applied",
            statusCode,
            data: { product: product.getProduct(), image: productImage },
         };
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: error.statusCode || 500 });
      }
   }

   async updateProduct({ productBody, statusCode, id }: IStatusCode & { productBody: ProductDTO; id: string }) {
      try {
         const product = await this.productModel.findByIdAndUpdate(id, productBody, { new: true, runValidators: true });
         if (!product) throw new ErrorHandler({ message: "Product not found", statusCode: 404 });
         return { success: true, message: "Product updated successfully", statusCode, data: { product: product.getProduct() } };
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: error.statusCode || 500 });
      }
   }

   async deleteProduct({ statusCode, id }: IStatusCode & { id: string }) {
      try {
         const product = await this.productModel.findByIdAndDelete(id);
         if (!product) throw new ErrorHandler({ message: "Product not found", statusCode: 404 });
         return { success: true, message: "Product deleted successfully", statusCode };
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: error.statusCode || 500 });
      }
   }

   async getAllProductsForAdmin({
      resultsPerPage,
      statusCode,
      queryParams,
   }: IStatusCode & { queryParams: ProductAdminSearchDTO; resultsPerPage: number }) {
      try {
         let { page, query, stock } = queryParams;
         const pipeline: Array<PipelineStage> = [];

         if (stock && stock === "true") pipeline.push({ $match: { stock: { $gt: 0 } } });
         else if (stock && stock === "false") pipeline.push({ $match: { stock: { $lte: 0 } } });

         if (query) {
            query = `.*${[...query].join(".*")}.*`;
            const regexQueryPattern = new RegExp(query, "i");
            pipeline.push({ $match: { name: regexQueryPattern } });
         }
         if (!page) page = 1;

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

         return {
            success: true,
            message: "Products found successfully",
            statusCode,
            data: { totalProducts, numberOfFetchedProducts: products.length, products },
         };
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: error.statusCode || 500 });
      }
   }
}
