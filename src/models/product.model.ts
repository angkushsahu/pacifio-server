import { Document, type Model, type InferSchemaType } from "mongoose";
import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true, collection: "products" })
export class Product {
   @Prop({ type: String, required: [true, "Please enter name of the product"], index: "text" })
   name: string;

   @Prop({ type: String, required: [true, "Please enter description for the product"] })
   description: string;

   @Prop({ type: Number, required: [true, "Please enter price of the product"], index: "ascending" })
   price: number;

   @Prop({ type: [{ publicUrl: String, secureUrl: String }], default: [] })
   images: Array<{ publicUrl: string; secureUrl: string }>;

   @Prop({ type: { publicUrl: String, secureUrl: String }, default: { publicUrl: "", secureUrl: "" } })
   defaultImage: { publicUrl: string; secureUrl: string };

   @Prop({
      type: String,
      enum: ["keyboard", "mouse", "mouse-pad", "cooling-pad", "headset"],
      required: [true, "Please select a category for the product"],
      index: true,
   })
   category: "keyboard" | "mouse" | "mouse-pad" | "cooling-pad" | "headset";

   @Prop({ type: Number, required: [true, "Please enter available stock of the product"] })
   stock: number;

   @Prop({
      type: { totalRatings: Number, numberOfReviews: Number, averageRating: { type: Number, index: "ascending" } },
      default: { totalRatings: 0, numberOfReviews: 0, averageRating: 0 },
   })
   rating: { totalRatings: number; numberOfReviews: number; averageRating: number };

   getProduct: (this: IProductDocument) => IProduct;
}

export const PRODUCT_MODEL = Product.name;
export const ProductSchema = SchemaFactory.createForClass(Product);

export type IProductSchemaType = InferSchemaType<typeof ProductSchema> & { createdAt: Date | string };
export type IProduct = Pick<
   IProductSchemaType,
   "category" | "description" | "images" | "name" | "price" | "rating" | "stock" | "createdAt" | "defaultImage"
> & {
   id: string;
};
export type IProductDocument = IProductSchemaType & Document;
export type IProductModel = Model<IProductDocument>;

ProductSchema.methods.getProduct = function (this: IProductDocument): IProduct {
   const formattedDate = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" }).format(
      this.createdAt as Date
   );

   return {
      id: this.id,
      name: this.name,
      description: this.description,
      category: this.category,
      defaultImage: this.defaultImage,
      images: this.images,
      price: this.price,
      stock: this.stock,
      createdAt: formattedDate,
      rating: this.rating,
   };
};
