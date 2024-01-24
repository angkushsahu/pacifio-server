import { Schema as mongooseSchema, type InferSchemaType, type Model } from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { PRODUCT_MODEL, type IProductDocument } from "./product.model";
import { USER_MODEL, type IUserDocument } from "./user.model";

@Schema({ timestamps: true, collection: "shoppingBags" })
export class ShoppingBag {
   @Prop({ type: mongooseSchema.Types.ObjectId, ref: USER_MODEL, required: [true, "Please specify user ID"] })
   user: string | mongooseSchema.Types.ObjectId | IUserDocument;

   @Prop({
      type: [
         {
            quantity: { type: Number, required: [true, "Please specify the number of items to be added in shopping bag"] },
            product: {
               type: mongooseSchema.Types.ObjectId,
               ref: PRODUCT_MODEL,
               required: [true, "Please specify ID of the product"],
            },
         },
      ],
   })
   products: Array<ShoppingBagProducts>;
}

export const SHOPPING_BAG_MODEL = ShoppingBag.name;
export const ShoppingBagSchema = SchemaFactory.createForClass(ShoppingBag);

export type ShoppingBagProducts = { quantity: number; product: string | mongooseSchema.Types.ObjectId | IProductDocument };
export type IShoppingBagSchemaType = InferSchemaType<typeof ShoppingBagSchema> & { createdAt: Date | string };
export type IShoppingBagDocument = IShoppingBagSchemaType & Document;
export type IShoppingBagModel = Model<IShoppingBagDocument>;
