import { InjectModel } from "@nestjs/mongoose";
import { Injectable } from "@nestjs/common";

import type { IProductModel, IReviewModel, IUserDocument, IUserModel } from "src/models";
import { PRODUCT_MODEL, REVIEW_MODEL, USER_MODEL } from "src/models";
import { GetAllReviewsDTO, ReviewDTO } from "./review.dto";
import { ErrorHandler } from "src/exceptions";
import type { IStatusCode } from "src/types";

@Injectable()
export default class ReviewService {
   constructor(
      @InjectModel(PRODUCT_MODEL) private readonly productModel: IProductModel,
      @InjectModel(REVIEW_MODEL) private readonly reviewModel: IReviewModel,
      @InjectModel(USER_MODEL) private readonly userModel: IUserModel
   ) {}

   async editReview({ body, statusCode, user }: { user: IUserDocument; body: ReviewDTO } & IStatusCode) {
      try {
         const product = await this.productModel.findById(body.productId);
         if (!product) throw new ErrorHandler({ message: "Product not found", statusCode: 404 });

         const alreadyReviewed = await this.reviewModel.findOne({ user: user._id, product: product._id });
         if (alreadyReviewed) {
            product.rating.totalRatings -= alreadyReviewed.rating;
            product.rating.totalRatings += body.rating;

            const averageRating = product.rating.totalRatings / product.rating.numberOfReviews;
            product.rating.averageRating = Number(averageRating.toFixed(1));
            await product.save();

            alreadyReviewed.rating = body.rating;
            alreadyReviewed.comment = body.comment;
            await alreadyReviewed.save();

            return {
               success: true,
               message: "Review updated successfully",
               statusCode,
               data: { review: alreadyReviewed.getReview(user.getUser()) },
            };
         }

         const review = await this.reviewModel.create({
            rating: body.rating,
            comment: body.comment,
            product: product._id,
            user: user._id,
         });
         if (!review) throw new ErrorHandler({ message: "Unable to create review, try again later", statusCode: 500 });

         product.rating.numberOfReviews++;
         product.rating.totalRatings += body.rating;

         const averageRating = product.rating.totalRatings / product.rating.numberOfReviews;
         product.rating.averageRating = Number(averageRating.toFixed(1));
         await product.save();

         return {
            success: true,
            message: "Review created successfully",
            statusCode,
            data: { review: review.getReview(user.getUser()) },
         };
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: error.statusCode || 500 });
      }
   }

   async getAllReviews({
      resultsPerPage,
      statusCode,
      queryParams,
      productId,
   }: IStatusCode & { productId: string; queryParams: GetAllReviewsDTO; resultsPerPage: number }) {
      const product = await this.productModel.findById(productId);
      if (!product) throw new ErrorHandler({ message: "Product not found", statusCode: 404 });

      try {
         let { page } = queryParams;
         if (!page) page = 1;

         const allReviews = await this.reviewModel
            .find({ product: product._id })
            .skip(resultsPerPage * (page - 1))
            .limit(resultsPerPage)
            .populate({ path: "user", select: "id name email role createdAt" });
         const reviews = allReviews.map((review) => {
            return review.getReview((review.user as IUserDocument).getUser());
         });
         if (!reviews) throw new ErrorHandler({ message: "Unable to find reviews", statusCode: 500 });

         const totalReviews = await this.reviewModel.countDocuments();

         return {
            success: true,
            message: "Reviews found successfully",
            statusCode,
            data: { totalReviews, numberOfFetchedReviews: reviews.length, reviews },
         };
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: error.statusCode || 500 });
      }
   }

   async getReview({ productId, statusCode, user }: { user: IUserDocument; productId: string } & IStatusCode) {
      try {
         const product = await this.productModel.findById(productId);
         if (!product) throw new ErrorHandler({ message: "Product not found", statusCode: 404 });

         const review = await this.reviewModel.findOne({ user: user._id, product: product._id });

         return {
            success: true,
            message: "Review found successfully",
            statusCode,
            data: { review: review?.getReview(user.getUser()) },
         };
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: error.statusCode || 500 });
      }
   }

   async getReviewById({ reviewId, statusCode }: { reviewId: string } & IStatusCode) {
      try {
         const review = await this.reviewModel.findById(reviewId);
         if (!review) throw new ErrorHandler({ message: "Review not found", statusCode: 404 });

         const user = await this.userModel.findById(review.user);

         return {
            success: true,
            message: "Review found successfully",
            statusCode,
            data: { review: user ? review.getReview(user.getUser()) : review },
         };
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: error.statusCode || 500 });
      }
   }

   async deleteReview({ productId, statusCode, user }: { user: IUserDocument; productId: string } & IStatusCode) {
      try {
         const product = await this.productModel.findById(productId);
         if (!product) throw new ErrorHandler({ message: "Product not found", statusCode: 404 });

         const review = await this.reviewModel.findOne({ user: user._id, product: product._id });
         if (!review) throw new ErrorHandler({ message: "Review not found", statusCode: 404 });

         product.rating.numberOfReviews--;
         product.rating.totalRatings -= review.rating;

         if (product.rating.numberOfReviews) {
            const averageRating = product.rating.totalRatings / product.rating.numberOfReviews;
            product.rating.averageRating = Number(averageRating.toFixed(1));
         } else {
            product.rating.averageRating = 0;
         }

         await product.save();
         await review.deleteOne();
         return { success: true, message: "Review deleted successfully", statusCode };
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: error.statusCode || 500 });
      }
   }
}
