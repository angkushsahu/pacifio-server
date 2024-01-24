import { Document, type Model, type InferSchemaType, Schema as mongooseSchema } from "mongoose";
import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";

import { type IUser, USER_MODEL, type IUserDocument } from "./user.model";
import { PRODUCT_MODEL, type IProductDocument } from "./product.model";

@Schema({ timestamps: true, collection: "reviews" })
export class Review {
   @Prop({
      type: Number,
      required: [true, "Please leave a rating out of 5"],
      min: [1, "Minimum rating is 1"],
      max: [5, "Maximum rating is 5"],
   })
   rating: number;

   @Prop({ type: String, required: [true, "Please leave a comment"] })
   comment: string;

   @Prop({ type: mongooseSchema.Types.ObjectId, ref: PRODUCT_MODEL, required: [true, "Please specify ID of the product"] })
   product: string | mongooseSchema.Types.ObjectId | IProductDocument;

   @Prop({ type: mongooseSchema.Types.ObjectId, ref: USER_MODEL, required: [true, "Please specify ID of the user"] })
   user: string | mongooseSchema.Types.ObjectId | IUserDocument;

   getReview: (this: IReviewDocument, user: IUser) => IReview;
}

export const REVIEW_MODEL = Review.name;
export const ReviewSchema = SchemaFactory.createForClass(Review);

export type IReviewSchemaType = InferSchemaType<typeof ReviewSchema> & { createdAt: Date | string };
export type IReview = Pick<IReviewSchemaType, "comment" | "createdAt" | "rating" | "user"> & { id: string };
export type IReviewDocument = IReviewSchemaType & Document;
export type IReviewModel = Model<IReviewDocument>;

ReviewSchema.methods.getReview = function (this: IReviewDocument, user: IUser): Omit<IReview, "user"> & { user: IUser } {
   const formattedDate = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" }).format(
      this.createdAt as Date
   );

   return {
      id: this.id,
      user,
      comment: this.comment,
      rating: this.rating,
      createdAt: formattedDate,
   };
};
